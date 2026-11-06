const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

console.log('--- Step 1: Updating modal-edit-club-profile (Auto Aggregated Metrics) ---');

const oldModalInputs = `        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Số lượng thành viên</label>
            <input type="number" id="edit-club-members" value="128" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tổng KM tích lũy</label>
            <input type="number" id="edit-club-km" value="42580.0" step="10" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold">
          </div>
        </div>`;

const newModalComponent = `        <!-- Auto Aggregated Member & KM Stats Component -->
        <div class="p-4 rounded-2xl bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-slate-50 border border-orange-200/80 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-1.5 font-black text-slate-900 text-xs uppercase tracking-wider">
              <span>⚡</span>
              <span>Chỉ Số Tự Động Tổng Hợp Từ Thành Viên</span>
            </div>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Tự động tính toán
            </span>
          </div>

          <!-- 4 Stats Cards: Members + 3 Time Scopes (All-time, Year, Month) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div class="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <div class="text-[10px] font-bold uppercase text-slate-400">Thành Viên CLB</div>
              <div id="modal-auto-members" class="text-sm sm:text-base font-black font-mono text-slate-900 mt-0.5">128 runners</div>
              <div class="text-[9px] text-emerald-600 font-bold mt-0.5">Active runners</div>
            </div>

            <div class="p-2.5 bg-white rounded-xl border border-orange-200 shadow-xs">
              <div class="text-[10px] font-bold uppercase text-orange-600/80">Toàn Bộ (All-time)</div>
              <div id="modal-auto-km-all" class="text-sm sm:text-base font-black font-mono text-[#FF5B26] mt-0.5">42,580.0 km</div>
              <div class="text-[9px] text-orange-600 font-bold mt-0.5">km lũy kế</div>
            </div>

            <div class="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <div class="text-[10px] font-bold uppercase text-amber-600">Năm 2026 (Hiện hữu)</div>
              <div id="modal-auto-km-year" class="text-sm sm:text-base font-black font-mono text-amber-600 mt-0.5">18,450.0 km</div>
              <div class="text-[9px] text-amber-700 font-bold mt-0.5">km năm nay</div>
            </div>

            <div class="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <div class="text-[10px] font-bold uppercase text-blue-600">Tháng 11 (Hiện hữu)</div>
              <div id="modal-auto-km-month" class="text-sm sm:text-base font-black font-mono text-blue-600 mt-0.5">3,170.0 km</div>
              <div class="text-[9px] text-blue-600 font-bold mt-0.5">km tháng này</div>
            </div>
          </div>

          <p class="text-[10px] text-slate-500 italic leading-relaxed">
            ℹ️ Số lượng thành viên và số KM tích lũy được hệ thống tự động tổng hợp từ kết quả bài chạy Strava của các thành viên CLB (không cần nhập thủ công).
          </p>
        </div>`;

if (code.includes(oldModalInputs)) {
  code = code.replace(oldModalInputs, newModalComponent);
  console.log('Replaced manual inputs in modal with auto-aggregated stats component!');
}

console.log('--- Step 2: Updating Club Cover Header Banner in Section 4.1 ---');

const oldCoverStats = `              <div class="hidden sm:flex items-center gap-4 text-white text-right relative z-10">
                <div>
                  <div class="text-[10px] uppercase text-orange-200 font-bold">Thành Viên</div>
                  <div id="club-stat-members" class="text-xl font-black font-mono">128 runners</div>
                </div>
                <div>
                  <div class="text-[10px] uppercase text-orange-200 font-bold">Tổng Tích Lũy</div>
                  <div id="club-stat-km" class="text-xl font-black font-mono">42,580.0 km</div>
                </div>
              </div>`;

const newCoverStats = `              <div class="hidden sm:flex items-center gap-3 text-white text-right relative z-10 bg-black/35 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-lg">
                <div>
                  <div class="text-[10px] uppercase text-orange-200 font-bold">Thành Viên</div>
                  <div id="club-stat-members" class="text-base sm:text-lg font-black font-mono text-white">128 runners</div>
                </div>
                <div class="h-7 w-px bg-white/20"></div>
                <div>
                  <div class="text-[10px] uppercase text-orange-200 font-bold">Toàn Bộ</div>
                  <div id="club-stat-km-all" class="text-base sm:text-lg font-black font-mono text-orange-300">42,580.0 km</div>
                </div>
                <div class="h-7 w-px bg-white/20"></div>
                <div>
                  <div class="text-[10px] uppercase text-orange-200 font-bold">Năm 2026</div>
                  <div id="club-stat-km-year" class="text-base sm:text-lg font-black font-mono text-amber-300">18,450.0 km</div>
                </div>
                <div class="h-7 w-px bg-white/20"></div>
                <div>
                  <div class="text-[10px] uppercase text-orange-200 font-bold">Tháng 11</div>
                  <div id="club-stat-km-month" class="text-base sm:text-lg font-black font-mono text-emerald-300">3,170.0 km</div>
                </div>
              </div>`;

if (code.includes(oldCoverStats)) {
  code = code.replace(oldCoverStats, newCoverStats);
  console.log('Updated cover header banner with 3-timeframe stats!');
}

console.log('--- Step 3: Adding KM Stats Breakdown Row below Cover Banner ---');

const oldSloganSection = `            <!-- Profile Info & Roster Section -->
            <div class="pt-14 p-6 sm:p-7 space-y-6">
              <!-- Slogan & Intro -->`;

const newBreakdownSection = `            <!-- Profile Info & Roster Section -->
            <div class="pt-14 p-6 sm:p-7 space-y-6">
              <!-- Auto-Aggregated KM Stats Breakdown (Toàn bộ, Trong năm, Trong tháng) -->
              <div class="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-orange-50/30 to-amber-50/20 border border-slate-200/80 space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-base">📊</span>
                    <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Cự Ly Tích Lũy Tự Động Tổng Hợp Từ Kết Quả Thành Viên</h3>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Tự động đồng bộ Strava
                    </span>
                  </div>
                  <span class="text-[11px] text-slate-400 font-medium">Thống kê theo 3 chu kỳ: Toàn bộ, Trong năm hiện hữu & Trong tháng hiện hữu</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div class="p-4 rounded-xl bg-white border border-orange-200/90 shadow-xs flex items-center justify-between">
                    <div>
                      <div class="text-[10px] font-bold uppercase text-orange-600">Toàn Bộ (All-Time)</div>
                      <div class="text-xl font-black font-mono text-[#FF5B26] mt-0.5" id="breakdown-km-all">42,580.0 km</div>
                      <div class="text-[10px] text-slate-400 mt-1">Lũy kế từ ngày thành lập (Tháng 3/2021)</div>
                    </div>
                    <div class="w-11 h-11 rounded-2xl bg-orange-100 text-[#FF5B26] flex items-center justify-center text-xl font-bold shrink-0">🌐</div>
                  </div>

                  <div class="p-4 rounded-xl bg-white border border-amber-200/90 shadow-xs flex items-center justify-between">
                    <div>
                      <div class="text-[10px] font-bold uppercase text-amber-700">Trong Năm 2026 (Hiện Hữu)</div>
                      <div class="text-xl font-black font-mono text-amber-600 mt-0.5" id="breakdown-km-year">18,450.0 km</div>
                      <div class="text-[10px] text-slate-400 mt-1">Tổng kết các giải và bài chạy năm 2026</div>
                    </div>
                    <div class="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold shrink-0">📅</div>
                  </div>

                  <div class="p-4 rounded-xl bg-white border border-blue-200/90 shadow-xs flex items-center justify-between">
                    <div>
                      <div class="text-[10px] font-bold uppercase text-blue-700">Trong Tháng 11 (Hiện Hữu)</div>
                      <div class="text-xl font-black font-mono text-blue-600 mt-0.5" id="breakdown-km-month">3,170.0 km</div>
                      <div class="text-[10px] text-slate-400 mt-1">348 ngày chuyên cần hợp lệ tháng này</div>
                    </div>
                    <div class="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold shrink-0">🗓️</div>
                  </div>
                </div>
              </div>

              <!-- Slogan & Intro -->`;

if (code.includes(oldSloganSection)) {
  code = code.replace(oldSloganSection, newBreakdownSection);
  console.log('Added KM Stats Breakdown Row below Cover Banner!');
}

console.log('--- Step 4: Updating Client JavaScript in main.ts ---');

// Update clubProfileState to include kmStats
const oldClubProfileState = `    let clubProfileState = {
      name: 'CLB Chạy Bộ SARC (Sáng Ánh Rạng Chiều)',
      shortName: 'SARC',
      slogan: 'Chạy Với Niềm Vui - Về Đích Cùng Đồng Đội - Lan Tỏa Sức Khỏe Cộng Đồng',
      description: 'CLB SARC quy tụ các vận động viên phong trào cự ly từ 5km đến Ultra Marathon. Tôn chỉ kết nối, trung thực thể thao và tương trợ lẫn nhau trên mọi cung đường.',
      founded: 'Tháng 3/2021',
      location: 'Hà Nội, Việt Nam',
      totalMembers: 128,
      totalCumulativeKm: 42580.0,`;

const newClubProfileState = `    let clubProfileState = {
      name: 'CLB Chạy Bộ SARC (Sáng Ánh Rạng Chiều)',
      shortName: 'SARC',
      slogan: 'Chạy Với Niềm Vui - Về Đích Cùng Đồng Đội - Lan Tỏa Sức Khỏe Cộng Đồng',
      description: 'CLB SARC quy tụ các vận động viên phong trào cự ly từ 5km đến Ultra Marathon. Tôn chỉ kết nối, trung thực thể thao và tương trợ lẫn nhau trên mọi cung đường.',
      founded: 'Tháng 3/2021',
      location: 'Hà Nội, Việt Nam',
      totalMembers: 128,
      kmStats: {
        allTime: 42580.0,
        thisYear: 18450.0,
        thisMonth: 3170.0
      },
      totalCumulativeKm: 42580.0,`;

if (code.includes(oldClubProfileState)) {
  code = code.replace(oldClubProfileState, newClubProfileState);
  console.log('Updated clubProfileState with kmStats!');
}

// Update renderClubDisplay()
const oldRenderClubDisplay = `    function renderClubDisplay() {
      const nameEl = document.getElementById('club-display-name');
      const metaEl = document.getElementById('club-display-meta');
      const sloganEl = document.getElementById('club-display-slogan');
      const descEl = document.getElementById('club-display-desc');
      const membersEl = document.getElementById('club-stat-members');
      const kmEl = document.getElementById('club-stat-km');
      const logoEl = document.getElementById('club-display-logo');

      if (nameEl) nameEl.innerText = clubProfileState.name;
      if (metaEl) metaEl.innerText = 'Thành lập: ' + clubProfileState.founded + ' • ' + clubProfileState.location;
      if (sloganEl) sloganEl.innerText = '"' + clubProfileState.slogan + '"';
      if (descEl) descEl.innerText = clubProfileState.description;
      if (membersEl) membersEl.innerText = clubProfileState.totalMembers + ' runners';
      if (kmEl) kmEl.innerText = Number(clubProfileState.totalCumulativeKm).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';
      if (logoEl) logoEl.innerText = clubProfileState.shortName;

      renderClubExecutives();
      renderClubAnnouncements(activePostFilter);
    }`;

const newRenderClubDisplay = `    function renderClubDisplay() {
      const nameEl = document.getElementById('club-display-name');
      const metaEl = document.getElementById('club-display-meta');
      const sloganEl = document.getElementById('club-display-slogan');
      const descEl = document.getElementById('club-display-desc');
      const membersEl = document.getElementById('club-stat-members');
      const logoEl = document.getElementById('club-display-logo');

      const kmStats = clubProfileState.kmStats || { allTime: 42580.0, thisYear: 18450.0, thisMonth: 3170.0 };

      if (nameEl) nameEl.innerText = clubProfileState.name;
      if (metaEl) metaEl.innerText = 'Thành lập: ' + clubProfileState.founded + ' • ' + clubProfileState.location;
      if (sloganEl) sloganEl.innerText = '"' + clubProfileState.slogan + '"';
      if (descEl) descEl.innerText = clubProfileState.description;
      if (membersEl) membersEl.innerText = clubProfileState.totalMembers + ' runners';
      if (logoEl) logoEl.innerText = clubProfileState.shortName;

      // Cover Header 3-Timeframe Stats
      const kmAllEl = document.getElementById('club-stat-km-all');
      if (kmAllEl) kmAllEl.innerText = Number(kmStats.allTime).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';
      const kmYearEl = document.getElementById('club-stat-km-year');
      if (kmYearEl) kmYearEl.innerText = Number(kmStats.thisYear).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';
      const kmMonthEl = document.getElementById('club-stat-km-month');
      if (kmMonthEl) kmMonthEl.innerText = Number(kmStats.thisMonth).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';

      // Section 4.1 Stats Breakdown Cards
      const bdAll = document.getElementById('breakdown-km-all');
      if (bdAll) bdAll.innerText = Number(kmStats.allTime).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';
      const bdYear = document.getElementById('breakdown-km-year');
      if (bdYear) bdYear.innerText = Number(kmStats.thisYear).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';
      const bdMonth = document.getElementById('breakdown-km-month');
      if (bdMonth) bdMonth.innerText = Number(kmStats.thisMonth).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';

      // Modal Auto-aggregated Badges
      const modMembers = document.getElementById('modal-auto-members');
      if (modMembers) modMembers.innerText = clubProfileState.totalMembers + ' runners';
      const modAll = document.getElementById('modal-auto-km-all');
      if (modAll) modAll.innerText = Number(kmStats.allTime).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';
      const modYear = document.getElementById('modal-auto-km-year');
      if (modYear) modYear.innerText = Number(kmStats.thisYear).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';
      const modMonth = document.getElementById('modal-auto-km-month');
      if (modMonth) modMonth.innerText = Number(kmStats.thisMonth).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';

      renderClubExecutives();
      renderClubAnnouncements(activePostFilter);
    }`;

if (code.includes(oldRenderClubDisplay)) {
  code = code.replace(oldRenderClubDisplay, newRenderClubDisplay);
  console.log('Updated renderClubDisplay() to handle 3-timeframe stats!');
}

// Update openEditClubProfileModal() and saveClubProfile()
const oldOpenEditClubProfileModal = `    function openEditClubProfileModal() {
      document.getElementById('edit-club-name').value = clubProfileState.name;
      document.getElementById('edit-club-shortname').value = clubProfileState.shortName;
      document.getElementById('edit-club-slogan').value = clubProfileState.slogan;
      document.getElementById('edit-club-desc').value = clubProfileState.description;
      document.getElementById('edit-club-founded').value = clubProfileState.founded;
      document.getElementById('edit-club-location').value = clubProfileState.location;
      document.getElementById('edit-club-members').value = clubProfileState.totalMembers;
      document.getElementById('edit-club-km').value = clubProfileState.totalCumulativeKm;
      document.getElementById('modal-edit-club-profile')?.classList.remove('hidden');
    }

    function closeEditClubProfileModal() {
      document.getElementById('modal-edit-club-profile')?.classList.add('hidden');
    }

    async function saveClubProfile() {
      const name = document.getElementById('edit-club-name').value.trim();
      const shortName = document.getElementById('edit-club-shortname').value.trim();
      const slogan = document.getElementById('edit-club-slogan').value.trim();
      const description = document.getElementById('edit-club-desc').value.trim();
      const founded = document.getElementById('edit-club-founded').value.trim();
      const location = document.getElementById('edit-club-location').value.trim();
      const totalMembers = parseInt(document.getElementById('edit-club-members').value, 10) || 128;
      const totalCumulativeKm = parseFloat(document.getElementById('edit-club-km').value) || 42580.0;

      if (!name) return showToast('Vui lòng nhập tên Câu lạc bộ');

      clubProfileState.name = name;
      clubProfileState.shortName = shortName;
      clubProfileState.slogan = slogan;
      clubProfileState.description = description;
      clubProfileState.founded = founded;
      clubProfileState.location = location;
      clubProfileState.totalMembers = totalMembers;
      clubProfileState.totalCumulativeKm = totalCumulativeKm;

      try {
        await fetch('/api/clubs/sarc-sadc/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, shortName, slogan, description, totalMembers, totalCumulativeKm })
        });
      } catch (e) {}

      renderClubDisplay();
      closeEditClubProfileModal();
      showToast('✓ Đã cập nhật thiết lập thông tin Câu Lạc Bộ thành công!');
    }`;

const newOpenEditClubProfileModal = `    function openEditClubProfileModal() {
      document.getElementById('edit-club-name').value = clubProfileState.name;
      document.getElementById('edit-club-shortname').value = clubProfileState.shortName;
      document.getElementById('edit-club-slogan').value = clubProfileState.slogan;
      document.getElementById('edit-club-desc').value = clubProfileState.description;
      document.getElementById('edit-club-founded').value = clubProfileState.founded;
      document.getElementById('edit-club-location').value = clubProfileState.location;

      // Update Auto Aggregated Metric Badges in Modal
      const kmStats = clubProfileState.kmStats || { allTime: 42580.0, thisYear: 18450.0, thisMonth: 3170.0 };
      const modMembers = document.getElementById('modal-auto-members');
      if (modMembers) modMembers.innerText = clubProfileState.totalMembers + ' runners';
      const modAll = document.getElementById('modal-auto-km-all');
      if (modAll) modAll.innerText = Number(kmStats.allTime).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';
      const modYear = document.getElementById('modal-auto-km-year');
      if (modYear) modYear.innerText = Number(kmStats.thisYear).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';
      const modMonth = document.getElementById('modal-auto-km-month');
      if (modMonth) modMonth.innerText = Number(kmStats.thisMonth).toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' km';

      document.getElementById('modal-edit-club-profile')?.classList.remove('hidden');
    }

    function closeEditClubProfileModal() {
      document.getElementById('modal-edit-club-profile')?.classList.add('hidden');
    }

    async function saveClubProfile() {
      const name = document.getElementById('edit-club-name').value.trim();
      const shortName = document.getElementById('edit-club-shortname').value.trim();
      const slogan = document.getElementById('edit-club-slogan').value.trim();
      const description = document.getElementById('edit-club-desc').value.trim();
      const founded = document.getElementById('edit-club-founded').value.trim();
      const location = document.getElementById('edit-club-location').value.trim();

      if (!name) return showToast('Vui lòng nhập tên Câu lạc bộ');

      clubProfileState.name = name;
      clubProfileState.shortName = shortName;
      clubProfileState.slogan = slogan;
      clubProfileState.description = description;
      clubProfileState.founded = founded;
      clubProfileState.location = location;
      // Members and KM stats remain automatically calculated from member activity results

      try {
        await fetch('/api/clubs/sarc-sadc/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, shortName, slogan, description, founded, location })
        });
      } catch (e) {}

      renderClubDisplay();
      closeEditClubProfileModal();
      showToast('✓ Đã cập nhật thiết lập thông tin Câu Lạc Bộ thành công!');
    }`;

if (code.includes(oldOpenEditClubProfileModal)) {
  code = code.replace(oldOpenEditClubProfileModal, newOpenEditClubProfileModal);
  console.log('Updated openEditClubProfileModal() and saveClubProfile()!');
}

fs.writeFileSync(mainTsPath, code, 'utf8');
console.log('Successfully written main.ts with auto-aggregated member & KM stats!');

