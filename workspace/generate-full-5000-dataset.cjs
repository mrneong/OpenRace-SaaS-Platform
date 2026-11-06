/**
 * OpenRace SaaS Platform - 5,000+ System Mass Data Generator
 * Generates exactly 5,000 Activities and associated system entities:
 * - 1,000 Athletes (Users) across 10 Teams and 4 Running Clubs
 * - 5,000 Activities with full GPS telemetry, pace, elevation gain, anti-cheat & Trail bonuses
 * - 5,000 Activity Evaluation Logs with Rule Engine 2.1 verdicts
 * - 1,000 Participant Ledgers with Dynamic VietQR payment codes
 * - 500 Multi-tier Appeals & Resolutions
 * - 1,000 Two-way Friendships
 * - 1,000 Social Kudos and Comments
 * Total records: 14,500 records (exceeds 5,000 activities benchmark)
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('  OPENRACE SAAS - GENERATING EXACTLY 5,000 SYSTEM ACTIVITIES');
console.log('================================================================\n');

const FIRST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đoàn'];
const MIDDLE_NAMES = ['Văn', 'Thị', 'Đức', 'Hải', 'Quốc', 'Kim', 'Thanh', 'Hồng', 'Minh', 'Tuấn', 'Ngọc', 'Xuân', 'Đình', 'Bảo', 'Thế', 'Gia'];
const LAST_NAMES = ['A', 'B', 'C', 'Dung', 'Đức', 'Kiệt', 'Nam', 'Thảo', 'Minh', 'Tuấn', 'Hùng', 'Linh', 'Trang', 'Hương', 'Huy', 'Sơn', 'Tú', 'Quyên', 'Long', 'Phúc', 'Việt', 'Bình', 'Thành', 'An', 'Khánh', 'Duy', 'Tâm', 'Hà', 'Phương'];

const CLUBS = [
  { id: 'club-sarc', slug: 'sarc-sadc', name: 'CLB Chạy Bộ SARC (Sáng Ánh Rạng Chiều)', bankBin: '970407', bankAccount: '1903688899901' },
  { id: 'club-sadc', slug: 'sadc-saigon', name: 'CLB Chạy Bộ SADC Sài Gòn', bankBin: '970415', bankAccount: '102938475601' },
  { id: 'club-hrc', slug: 'hanoi-runners', name: 'Hanoi Runners Club (HRC)', bankBin: '970422', bankAccount: '883920192837' },
  { id: 'club-vkl', slug: 'vkl-runners', name: 'VKL Marathon Team', bankBin: '970436', bankAccount: '772819203948' }
];

const TEAMS = [
  { id: 'team-phoenix', name: 'Team Phoenix SARC', clubId: 'club-sarc', leaderId: 'user-0001' },
  { id: 'team-dragons', name: 'Team Dragons SADC', clubId: 'club-sarc', leaderId: 'user-0002' },
  { id: 'team-tigers', name: 'Team Tigers SADC', clubId: 'club-sarc', leaderId: 'user-0003' },
  { id: 'team-hawks', name: 'Team Hawks SARC', clubId: 'club-sarc', leaderId: 'user-0004' },
  { id: 'team-eagles', name: 'Team Eagles SADC', clubId: 'club-sarc', leaderId: 'user-0005' },
  { id: 'team-sharks', name: 'Team Sharks SADC', clubId: 'club-sadc', leaderId: 'user-0006' },
  { id: 'team-wolves', name: 'Team Wolves SADC', clubId: 'club-sadc', leaderId: 'user-0007' },
  { id: 'team-panthers', name: 'Team Panthers HRC', clubId: 'club-hrc', leaderId: 'user-0008' },
  { id: 'team-cheetahs', name: 'Team Cheetahs HRC', clubId: 'club-hrc', leaderId: 'user-0009' },
  { id: 'team-falcons', name: 'Team Falcons VKL', clubId: 'club-vkl', leaderId: 'user-0010' }
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, dec = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));

// 1. Generate 1,000 Athletes
console.log('>>> [1/7] Generating 1,000 Athletes across 10 Teams & 4 Clubs...');
const users = [];
for (let i = 1; i <= 1000; i++) {
  const pad = String(i).padStart(4, '0');
  const id = `user-${pad}`;
  const name = i === 1 ? 'Nguyễn Văn A' : i === 2 ? 'Trần Thị B' : i === 3 ? 'Lê Hoàng C' : `${pick(FIRST_NAMES)} ${pick(MIDDLE_NAMES)} ${pick(LAST_NAMES)}`;
  const email = i === 1 ? 'athlete.nguyen@sarc.vn' : `runner.${pad}@openrace.vn`;
  const assignedTeam = pick(TEAMS);

  users.push({
    id,
    name,
    email,
    avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + (i % 250)}?w=150`,
    stravaId: `strava-${100000 + i}`,
    stravaConnected: Math.random() > 0.04, // 96% connected
    teamId: assignedTeam.id,
    teamName: assignedTeam.name,
    clubId: assignedTeam.clubId,
    role: i <= 10 ? (i <= 3 ? 'ADMIN' : 'CAPTAIN') : 'RUNNER',
    status: Math.random() > 0.02 ? 'ACTIVE' : 'LOCKED',
    createdAt: new Date(Date.now() - randInt(10, 120) * 86400000).toISOString()
  });
}
console.log(`  ✓ Generated ${users.length} athletes.`);

// 2. Generate EXACTLY 5,000 Activities across varied realistic categories
console.log('>>> [2/7] Generating EXACTLY 5,000 Running Activities with GPS Metrics & Anti-Cheat...');
const activities = [];
const activityLogs = [];

const BASE_TIME = Date.now() - 45 * 86400000; // last 45 days

for (let i = 1; i <= 5000; i++) {
  const pad = String(i).padStart(5, '0');
  const actId = `act-${pad}`;
  const athlete = pick(users);

  // Distribute scenarios:
  // 72% Standard Valid Run (pace 4:00 - 9:50)
  // 12% Trail Run with Elevation Gain bonus (pace 10:00 - 14:00, gain >= 100m)
  // 6% Distance Below Minimum (< 3.0 km)
  // 4% System Pace Floor Violation (< 2:45 min/km) -> mechanical/vehicle fraud
  // 3% Trail Pace Slow without sufficient Gain (< 100m)
  // 1.5% Duplicate Overlap
  // 1.5% Manual Entry
  const randType = Math.random();
  let sportType = 'Run';
  let distanceKm = 5.0;
  let movingTimeSec = 1800; // default 6:00 min/km
  let elevationGainM = 20;
  let isValid = true;
  let rejectCode = null;
  let bonusKm = 0.0;
  let title = 'Chạy buổi sáng';
  let avgCadence = randInt(162, 178);
  let maxSpeedKmH = randFloat(11.0, 15.5);

  const dayOffset = randInt(0, 44);
  const startAt = new Date(BASE_TIME + dayOffset * 86400000 + randInt(5, 20) * 3600000 + randInt(0, 59) * 60000);

  if (randType < 0.72) {
    // 72%: Standard Valid Run
    distanceKm = randFloat(3.5, 21.1);
    const paceMinPerKm = randFloat(4.2, 9.5); // within 4:00 - 10:00
    movingTimeSec = Math.round(distanceKm * paceMinPerKm * 60);
    elevationGainM = randInt(5, 75);
    title = pick([
      'Chạy công viên Yên Sở', 'Hồ Tây đón bình minh', 'Hồ Gươm cuối tuần',
      'Chạy phục hồi nhẹ', 'Long run sáng Chủ Nhật', 'Chạy Tempo quanh hồ',
      'Chạy bến Bạch Đằng', 'Khu đô thị Sala sáng sớm', 'Công viên Cầu Giấy',
      'Đại lộ Võ Nguyên Giáp', 'Công viên Thống Nhất'
    ]);
    isValid = true;
    avgCadence = randInt(165, 182);
    maxSpeedKmH = randFloat(12.0, 16.5);
  } else if (randType < 0.84) {
    // 12%: Trail Run with valid Elevation Gain
    sportType = 'TrailRun';
    distanceKm = randFloat(6.0, 32.0);
    const paceMinPerKm = randFloat(10.1, 14.2); // compensated by gain
    movingTimeSec = Math.round(distanceKm * paceMinPerKm * 60);
    elevationGainM = randInt(120, 950);
    // Trail bonus: floor(gain / 100) * 1.0, capped at 5.0 km
    bonusKm = Math.min(Math.floor(elevationGainM / 100) * 1.0, 5.0);
    title = pick([
      'Chạy Trail Đền Gióng', 'Trail Núi Hàm Lợn', 'Trail Ba Vì Challenge',
      'Trail Tam Đảo leo dốc', 'Chạy địa hình rừng Sóc Sơn', 'Trail Núi Dinh Vũng Tàu',
      'Trail Chứa Chan Đồng Nai', 'Trail Núi Bà Đen Tây Ninh'
    ]);
    isValid = true;
    avgCadence = randInt(155, 172);
    maxSpeedKmH = randFloat(10.5, 14.0);
  } else if (randType < 0.90) {
    // 6%: Distance Below Minimum (< 3.0 km)
    distanceKm = randFloat(1.2, 2.9);
    const paceMinPerKm = randFloat(5.0, 7.5);
    movingTimeSec = Math.round(distanceKm * paceMinPerKm * 60);
    elevationGainM = randInt(0, 15);
    title = 'Khởi động ngắn công viên (Dưới 3km)';
    isValid = false;
    rejectCode = 'BELOW_MIN_DISTANCE';
    avgCadence = randInt(160, 170);
  } else if (randType < 0.94) {
    // 4%: System Pace Floor Violation (< 2:45 min/km) -> Suspected Mechanical / Vehicle Fraud
    distanceKm = randFloat(4.0, 12.0);
    const paceMinPerKm = randFloat(1.4, 2.7); // < 2:45 min/km!
    movingTimeSec = Math.round(distanceKm * paceMinPerKm * 60);
    elevationGainM = randInt(5, 25);
    title = 'Chạy nghi vấn đi xe máy (Pace siêu tốc)';
    isValid = false;
    rejectCode = 'PACE_IMPLAUSIBLE';
    avgCadence = randInt(90, 120); // Low cadence indicating vehicle
    maxSpeedKmH = randFloat(28.0, 55.0);
  } else if (randType < 0.97) {
    // 3%: Trail Pace Slow without sufficient Gain (< 100m)
    distanceKm = randFloat(4.0, 8.5);
    const paceMinPerKm = randFloat(10.5, 13.5);
    movingTimeSec = Math.round(distanceKm * paceMinPerKm * 60);
    elevationGainM = randInt(10, 80); // < 100m
    title = 'Đi bộ thư giãn cuối tuần (Pace quá chậm không đủ dốc)';
    isValid = false;
    rejectCode = 'PACE_TOO_SLOW_NO_GAIN';
    avgCadence = randInt(130, 145);
  } else if (randType < 0.985) {
    // 1.5%: Duplicate Overlap
    distanceKm = randFloat(5.0, 10.0);
    const paceMinPerKm = randFloat(5.3, 6.5);
    movingTimeSec = Math.round(distanceKm * paceMinPerKm * 60);
    elevationGainM = randInt(10, 30);
    title = 'Bài chạy ghi nhận trùng thiết bị Garmin/Strava';
    isValid = false;
    rejectCode = 'DUPLICATE_OVERLAP';
  } else {
    // 1.5%: Manual Entry
    distanceKm = randFloat(5.0, 10.0);
    movingTimeSec = 1800;
    elevationGainM = 0;
    title = 'Nhập tay từ máy chạy bộ gym (Manual Entry)';
    isValid = false;
    rejectCode = 'MANUAL_ENTRY';
  }

  const finalKm = isValid ? parseFloat((distanceKm + bonusKm).toFixed(1)) : 0.0;
  const paceMinutes = Math.floor((movingTimeSec / distanceKm) / 60);
  const paceSeconds = Math.round((movingTimeSec / distanceKm) % 60);
  const paceStr = `${paceMinutes}:${String(paceSeconds).padStart(2, '0')}`;

  const actRecord = {
    id: actId,
    userId: athlete.id,
    athleteName: athlete.name,
    teamId: athlete.teamId,
    teamName: athlete.teamName,
    sportType,
    title,
    distanceKm: parseFloat(distanceKm.toFixed(1)),
    movingTimeSec,
    elevationGainM,
    paceStr,
    avgCadence,
    maxSpeedKmH,
    startAt: startAt.toISOString(),
    isManual: rejectCode === 'MANUAL_ENTRY'
  };
  activities.push(actRecord);

  // Evaluated Log
  activityLogs.push({
    activityId: actId,
    raceId: 'season-10-run-to-techcombank',
    userId: athlete.id,
    isValid,
    rejectCode,
    bonusKm,
    finalKm,
    evaluatedAt: new Date(startAt.getTime() + 60000).toISOString()
  });
}
console.log(`  ✓ Generated EXACTLY ${activities.length} activities.`);
console.log(`  ✓ Generated ${activityLogs.length} evaluation logs.`);

// 3. Generate 1,000 Finance Ledger Entries with Dynamic VietQR
console.log('>>> [3/7] Generating 1,000 Financial Ledgers & Dynamic VietQR Codes...');
const ledgers = [];
for (let i = 1; i <= 1000; i++) {
  const pad = String(i).padStart(4, '0');
  const athlete = users[(i - 1) % users.length];
  const isRank1Team = athlete.teamId === 'team-phoenix';
  const baseFee = isRank1Team ? 100000 : 200000;
  const missWeeks = Math.random() < 0.25 ? randInt(1, 3) : 0;
  const penalty = missWeeks * 50000;
  const total = baseFee + penalty;
  const isPaid = Math.random() < 0.48;
  const shortCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  const paymentRef = `OR10-${shortCode}${i % 100}`;

  ledgers.push({
    id: `fin-ledger-${pad}`,
    userId: athlete.id,
    athleteName: athlete.name,
    teamId: athlete.teamId,
    teamName: athlete.teamName,
    raceId: 'season-10-run-to-techcombank',
    baseFeeVnd: baseFee,
    penaltyVnd: penalty,
    totalDueVnd: total,
    paidVnd: isPaid ? total : 0,
    status: isPaid ? 'PAID' : (Math.random() < 0.15 ? 'PENDING_CONFIRMATION' : 'UNPAID'),
    paymentReference: paymentRef,
    vietQrPayload: `https://img.vietqr.io/image/970407-1903688899901-compact2.png?amount=${total}&addInfo=${paymentRef}&accountName=CLB%20CHAY%20BO%20SARC`,
    updatedAt: new Date().toISOString()
  });
}
console.log(`  ✓ Generated ${ledgers.length} financial ledger entries.`);

// 4. Generate 500 Multi-Tier Appeals
console.log('>>> [4/7] Generating 500 Multi-Tier Appeals & Resolutions...');
const appeals = [];
const rejectedActs = activities.filter((a, idx) => !activityLogs[idx].isValid);

for (let i = 1; i <= 500; i++) {
  const pad = String(i).padStart(4, '0');
  const targetAct = rejectedActs[(i - 1) % rejectedActs.length];
  const isApproved = Math.random() < 0.45;
  const isRejected = Math.random() < 0.20;
  const status = isApproved ? 'APPROVED' : (isRejected ? 'REJECTED' : 'OPEN');

  appeals.push({
    id: `appeal-${pad}`,
    activityId: targetAct.id,
    userId: targetAct.userId,
    athleteName: targetAct.athleteName,
    raceId: 'season-10-run-to-techcombank',
    reason: pick([
      'Chạy qua hầm Kim Liên mất tín hiệu GPS dẫn tới trôi pace',
      'Đoạn leo dốc Hàm Lợn đồng hồ Garmin ghi nhận thiếu độ cao',
      'Đồng hồ hết pin giữa đường, chạy tiếp 5km trên app điện thoại',
      'Lỗi đồng bộ tự động từ Strava thiếu mất 1.5km',
      'Pace 2:38 do gió xuôi dốc cầu Nhật Tân, nhịp tim đạt 182 bpm hợp lệ',
      'Chạy trong khu đô thị nhiều nhà cao tầng bị ngắt quãng tín hiệu vệ tinh'
    ]),
    status,
    evidenceUrl: `https://images.unsplash.com/photo-${1517649763962 + (i % 100)}?w=400`,
    creditedKm: isApproved ? targetAct.distanceKm : 0.0,
    reviewedBy: status !== 'OPEN' ? 'Hoàng Văn Minh (Club Admin)' : null,
    createdAt: new Date(Date.now() - randInt(1, 14) * 86400000).toISOString()
  });
}
console.log(`  ✓ Generated ${appeals.length} appeals and resolutions.`);

// 5. Generate 1,000 Friendships (2-Way Social Network)
console.log('>>> [5/7] Generating 1,000 2-Way Friendships...');
const friendships = [];
const pairSet = new Set();

for (let i = 1; i <= 1000; i++) {
  const userA = pick(users);
  let userB = pick(users);
  while (userB.id === userA.id) {
    userB = pick(users);
  }
  const key = [userA.id, userB.id].sort().join(':');
  if (!pairSet.has(key)) {
    pairSet.add(key);
    friendships.push({
      id: `fr-${String(i).padStart(4, '0')}`,
      userAId: userA.id,
      userAName: userA.name,
      userBId: userB.id,
      userBName: userB.name,
      status: Math.random() < 0.88 ? 'ACCEPTED' : 'PENDING',
      connectedAt: new Date(Date.now() - randInt(1, 60) * 86400000).toISOString()
    });
  }
}
console.log(`  ✓ Generated ${friendships.length} unique friendship connections.`);

// 6. Generate 1,000 Social Kudos & Activity Comments
console.log('>>> [6/7] Generating 1,000 Social Kudos & Activity Comments...');
const socialEngagements = [];
for (let i = 1; i <= 1000; i++) {
  const act = pick(activities);
  const actor = pick(users);
  const isKudos = i % 2 === 1;

  socialEngagements.push({
    id: `soc-${String(i).padStart(4, '0')}`,
    activityId: act.id,
    userId: actor.id,
    userName: actor.name,
    type: isKudos ? 'KUDOS' : 'COMMENT',
    commentText: isKudos ? null : pick([
      'Chân chạy đều quá anh ơi! 🔥',
      'Tuyệt vời, giữ vững phong độ nhé!',
      'Pace đẹp quá bạn ơi!',
      'Hôm nào giao lưu hồ Tây nhé!',
      'Cố lên team ơi, sắp vượt Dragons rồi! 🏆',
      'Đoạn dốc đỉnh quá, kudos mạnh!',
      'Hôm nay chạy mát trời thích thật!',
      'Kỷ lục cự ly mới rồi, chúc mừng bạn!'
    ]),
    createdAt: new Date().toISOString()
  });
}
console.log(`  ✓ Generated ${socialEngagements.length} social kudos and comments.`);

// Total Count Verification
const totalRecords = users.length + activities.length + activityLogs.length + ledgers.length + appeals.length + friendships.length + socialEngagements.length;
console.log('\n================================================================');
console.log(`  TOTAL DATASET RECORDS GENERATED: ${totalRecords.toLocaleString()}`);
console.log(`  PRIMARY ACTIVITIES COUNT       : ${activities.length.toLocaleString()}`);
console.log('================================================================\n');

// 7. Save to shared_context/MOCK_5000_DATASET.json
const dataset = {
  meta: {
    project: 'OpenRace SaaS Platform',
    version: '2.6.0',
    generatedAt: new Date().toISOString(),
    primaryActivityCount: activities.length,
    totalRecordCount: totalRecords
  },
  counts: {
    users: users.length,
    activities: activities.length,
    activityLogs: activityLogs.length,
    ledgers: ledgers.length,
    appeals: appeals.length,
    friendships: friendships.length,
    socialEngagements: socialEngagements.length
  },
  data: {
    users,
    activities,
    activityLogs,
    ledgers,
    appeals,
    friendships,
    socialEngagements
  }
};

const outPath = path.resolve(__dirname, '../shared_context/MOCK_5000_DATASET.json');
fs.writeFileSync(outPath, JSON.stringify(dataset, null, 2), 'utf8');
const stat = fs.statSync(outPath);
console.log(`Successfully saved dataset to: ${outPath} (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);
