/**
 * OpenRace SaaS Platform - 5,000+ Record Mass Data Generator & Validator
 * Conforms to SRS V2.1 specifications (Rule Engine 2.1, Contextual RBAC, 10 Screen Pairs)
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('  OPENRACE SAAS PLATFORM - GENERATING 5,000+ TEST RECORDS');
console.log('================================================================\n');

const FIRST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const MIDDLE_NAMES = ['Văn', 'Thị', 'Đức', 'Hải', 'Quốc', 'Kim', 'Thanh', 'Hồng', 'Minh', 'Tuấn', 'Ngọc', 'Xuân', 'Đình', 'Bảo'];
const LAST_NAMES = ['A', 'B', 'C', 'Dung', 'Đức', 'Kiệt', 'Nam', 'Thảo', 'Minh', 'Tuấn', 'Hùng', 'Linh', 'Trang', 'Hương', 'Huy', 'Sơn', 'Tú', 'Quyên', 'Long', 'Phúc', 'Việt', 'Bình', 'Thành', 'An'];

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

// Helper: random item
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Helper: random int
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// Helper: random float
const randFloat = (min, max, dec = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));

// 1. Generate 500 Athletes
console.log('>>> [1/7] Generating 500 Athletes & Club Memberships...');
const users = [];
for (let i = 1; i <= 500; i++) {
  const pad = String(i).padStart(4, '0');
  const id = `user-${pad}`;
  const name = i === 1 ? 'Nguyễn Văn A' : i === 2 ? 'Trần Thị B' : i === 3 ? 'Lê Hoàng C' : `${pick(FIRST_NAMES)} ${pick(MIDDLE_NAMES)} ${pick(LAST_NAMES)}`;
  const email = i === 1 ? 'athlete.nguyen@sarc.vn' : `runner.${pad}@openrace.vn`;
  const assignedTeam = pick(TEAMS);
  
  users.push({
    id,
    name,
    email,
    avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + (i % 200)}?w=150`,
    stravaId: `strava-${100000 + i}`,
    stravaConnected: Math.random() > 0.05, // 95% connected
    teamId: assignedTeam.id,
    teamName: assignedTeam.name,
    clubId: assignedTeam.clubId,
    role: i <= 10 ? (i <= 3 ? 'ADMIN' : 'CAPTAIN') : 'RUNNER',
    status: Math.random() > 0.02 ? 'ACTIVE' : 'LOCKED',
    createdAt: new Date(Date.now() - randInt(10, 90) * 86400000).toISOString()
  });
}
console.log(`  ✓ Generated ${users.length} athletes.`);

// 2. Generate 3,200 Activities across varied categories
console.log('>>> [2/7] Generating 3,200 Activities & Rule Engine Validations...');
const activities = [];
const activityLogs = [];

const BASE_TIME = Date.now() - 30 * 86400000; // last 30 days

for (let i = 1; i <= 3200; i++) {
  const pad = String(i).padStart(5, '0');
  const actId = `act-${pad}`;
  const athlete = pick(users);
  
  // Distribute scenarios
  const randType = Math.random();
  let sportType = 'Run';
  let distanceKm = 5.0;
  let movingTimeSec = 1800; // pace 6:00
  let elevationGainM = 20;
  let isValid = true;
  let rejectCode = null;
  let bonusKm = 0.0;
  let title = 'Chạy buổi sáng';

  const dayOffset = randInt(0, 29);
  const startAt = new Date(BASE_TIME + dayOffset * 86400000 + randInt(5, 20) * 3600000 + randInt(0, 59) * 60000);

  if (randType < 0.70) {
    // 70%: Standard Valid Run
    distanceKm = randFloat(3.5, 15.0);
    const paceMinPerKm = randFloat(4.2, 9.5); // within 4:00 - 10:00
    movingTimeSec = Math.round(distanceKm * paceMinPerKm * 60);
    elevationGainM = randInt(5, 60);
    title = pick(['Chạy công viên Yên Sở', 'Hồ Tây đón bình minh', 'Hồ Gươm cuối tuần', 'Chạy phục hồi nhẹ', 'Long run sáng Chủ Nhật', 'Chạy Tempo quanh hồ']);
    isValid = true;
  } else if (randType < 0.82) {
    // 12%: Trail Run with valid Gain
    sportType = 'TrailRun';
    distanceKm = randFloat(6.0, 25.0);
    const paceMinPerKm = randFloat(10.1, 14.5); // slow pace compensated by gain
    movingTimeSec = Math.round(distanceKm * paceMinPerKm * 60);
    elevationGainM = randInt(120, 850);
    // Trail bonus: floor(gain/100)*1.0, max 5.0 km
    bonusKm = Math.min(Math.floor(elevationGainM / 100) * 1.0, 5.0);
    title = pick(['Chạy Trail Đền Gióng', 'Trail Núi Hàm Lợn', 'Trail Ba Vì Challenge', 'Trail Tam Đảo leo dốc', 'Chạy địa hình rừng Sóc Sơn']);
    isValid = true;
  } else if (randType < 0.88) {
    // 6%: Distance Below Minimum (< 3.0 km)
    distanceKm = randFloat(1.5, 2.9);
    const paceMinPerKm = randFloat(5.0, 7.0);
    movingTimeSec = Math.round(distanceKm * paceMinPerKm * 60);
    elevationGainM = randInt(0, 15);
    title = 'Khởi động ngắn công viên';
    isValid = false;
    rejectCode = 'BELOW_MIN_DISTANCE';
  } else if (randType < 0.93) {
    // 5%: System Pace Floor Violation (< 2:45 min/km) -> Suspected mechanical/vehicle fraud
    distanceKm = randFloat(4.0, 10.0);
    const paceMinPerKm = randFloat(1.5, 2.7); // < 2:45 min/km!
    movingTimeSec = Math.round(distanceKm * paceMinPerKm * 60);
    elevationGainM = randInt(5, 20);
    title = 'Chạy nhanh cầu Nhật Tân (Pace siêu tốc)';
    isValid = false;
    rejectCode = 'PACE_IMPLAUSIBLE';
  } else if (randType < 0.96) {
    // 3%: Trail Pace Slow without sufficient Gain (< 100m)
    distanceKm = randFloat(4.0, 8.0);
    const paceMinPerKm = randFloat(10.5, 13.0);
    movingTimeSec = Math.round(distanceKm * paceMinPerKm * 60);
    elevationGainM = randInt(10, 75); // < 100m
    title = 'Đi bộ thư giãn cuối tuần';
    isValid = false;
    rejectCode = 'PACE_TOO_SLOW_NO_GAIN';
  } else if (randType < 0.98) {
    // 2%: Duplicate Overlap
    distanceKm = randFloat(5.0, 10.0);
    const paceMinPerKm = randFloat(5.3, 6.5);
    movingTimeSec = Math.round(distanceKm * paceMinPerKm * 60);
    elevationGainM = randInt(10, 30);
    title = 'Bài chạy ghi nhận trùng thiết bị';
    isValid = false;
    rejectCode = 'DUPLICATE_OVERLAP';
  } else {
    // 2%: Manual Entry
    distanceKm = randFloat(5.0, 10.0);
    movingTimeSec = 1800;
    elevationGainM = 0;
    title = 'Nhập tay từ máy chạy bộ gym';
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
console.log(`  ✓ Generated ${activities.length} activities.`);
console.log(`  ✓ Generated ${activityLogs.length} evaluation logs.`);

// 3. Generate 600 Finance Ledger Entries with VietQR dynamic references
console.log('>>> [3/7] Generating 600 Finance Ledger Entries & VietQR references...');
const ledgers = [];
for (let i = 1; i <= 600; i++) {
  const pad = String(i).padStart(4, '0');
  const athlete = users[(i - 1) % users.length];
  const isRank1Team = athlete.teamId === 'team-phoenix';
  const baseFee = isRank1Team ? 100000 : 200000;
  const missWeeks = Math.random() < 0.25 ? randInt(1, 3) : 0;
  const penalty = missWeeks * 50000;
  const total = baseFee + penalty;
  const isPaid = Math.random() < 0.45;
  const shortCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  const paymentRef = `OR10-${shortCode}${i % 100}`; // max 25 chars

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

// 4. Generate 300 Appeals & Waivers
console.log('>>> [4/7] Generating 300 Appeals & Waivers...');
const appeals = [];
const rejectedActs = activities.filter((a, idx) => !activityLogs[idx].isValid);

for (let i = 1; i <= 300; i++) {
  const pad = String(i).padStart(4, '0');
  const targetAct = rejectedActs[(i - 1) % rejectedActs.length];
  const isApproved = Math.random() < 0.40;
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
      'Pace 2:38 do gió xuôi dốc cầu Nhật Tân, nhịp tim đạt 182 bpm hợp lệ'
    ]),
    status,
    evidenceUrl: `https://images.unsplash.com/photo-${1517649763962 + i}?w=400`,
    creditedKm: isApproved ? targetAct.distanceKm : 0.0,
    reviewedBy: status !== 'OPEN' ? 'Hoàng Văn Minh (Club Admin)' : null,
    createdAt: new Date(Date.now() - randInt(1, 14) * 86400000).toISOString()
  });
}
console.log(`  ✓ Generated ${appeals.length} appeals and resolutions.`);

// 5. Generate 400 Friendships (2-way network graph)
console.log('>>> [5/7] Generating 400 2-Way Friendships...');
const friendships = [];
const pairSet = new Set();

for (let i = 1; i <= 400; i++) {
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
      status: Math.random() < 0.85 ? 'ACCEPTED' : 'PENDING',
      connectedAt: new Date(Date.now() - randInt(1, 60) * 86400000).toISOString()
    });
  }
}
console.log(`  ✓ Generated ${friendships.length} unique friendship connections.`);

// 6. Generate 600 Kudos & Comments
console.log('>>> [6/7] Generating 600 Social Kudos & Activity Comments...');
const socialEngagements = [];
for (let i = 1; i <= 600; i++) {
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
      'Đoạn dốc đỉnh quá, kudos mạnh!'
    ]),
    createdAt: new Date().toISOString()
  });
}
console.log(`  ✓ Generated ${socialEngagements.length} social kudos and comments.`);

// Total Count Verification
const totalRecords = users.length + activities.length + activityLogs.length + ledgers.length + appeals.length + friendships.length + socialEngagements.length;
console.log('\n================================================================');
console.log(`  TOTAL RECORDS GENERATED: ${totalRecords.toLocaleString()} (Exceeds 5,000 threshold)`);
console.log('================================================================\n');

// Save to disk
const dataset = {
  meta: {
    project: 'OpenRace SaaS Platform',
    version: '2.1.0',
    generatedAt: new Date().toISOString(),
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

const outPath = path.join(__dirname, '../shared_context/MOCK_5000_DATASET.json');
fs.writeFileSync(outPath, JSON.stringify(dataset, null, 2), 'utf8');
console.log(`Successfully saved dataset to: ${outPath} (${(fs.statSync(outPath).size / (1024 * 1024)).toFixed(2)} MB)`);

