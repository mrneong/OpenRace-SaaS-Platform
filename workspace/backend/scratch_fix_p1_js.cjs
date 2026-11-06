const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'src', 'main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

const target = "    window.addEventListener('DOMContentLoaded', () => {";

const functionsJs = `    // Subsystem [1.0] DASHBOARD RUNNER STATE & HANDLERS
    let userRacesData = [
      {
        raceId: 'race-season-10',
        name: 'Mùa 10 Run to Techcombank 2026',
        slug: 'season-10-run-to-techcombank',
        club: 'SARC',
        team: 'Phoenix SARC',
        standing: '#1 Dẫn đầu',
        badge: 'gold',
        personalKm: 125.0,
        teamKm: 1250.0
      },
      {
        raceId: 'race-trail-bavi-2026',
        name: 'SARC Trail Challenge Ba Vì 2026',
        slug: 'sarc-trail-challenge-bavi-2026',
        club: 'SARC Trail Division',
        team: 'Dragons Trail',
        standing: 'Đồng hạng 2',
        badge: 'silver',
        personalKm: 42.0,
        teamKm: 1000.0
      },
      {
        raceId: 'race-vpbank-prep',
        name: 'VPBank Hanoi Marathon Prep 2026',
        slug: 'vpbank-hanoi-marathon-prep-2026',
        club: 'Hanoi Runners Union',
        team: 'Tigers Speed',
        standing: 'Đồng hạng 2',
        badge: 'silver',
        personalKm: 68.0,
        teamKm: 928.0
      }
    ];
    let currentRaceIdx = 0;
    let completedWeeklyKm = 18.5;
    let targetWeeklyKm = 20.0;

    function renderRaceSlide() {
      if (!userRacesData || userRacesData.length === 0) return;
      const race = userRacesData[currentRaceIdx];
      const titleEl = document.getElementById('race-card-title');
      const clubEl = document.getElementById('race-card-club');
      const badgeTextEl = document.getElementById('race-card-badge-text');
      const badgeContainer = document.getElementById('race-card-badge');
      const kmEl = document.getElementById('race-card-km');
      const counterEl = document.getElementById('race-slide-index');

      if (titleEl) titleEl.innerText = race.name;
      if (clubEl) clubEl.innerHTML = 'CLB: ' + race.club + ' • Đội: <span id="race-card-team" class="text-orange-400 font-bold">' + race.team + '</span>';
      if (badgeTextEl) badgeTextEl.innerText = race.standing;
      if (badgeContainer) {
        badgeContainer.className = race.badge === 'gold' 
          ? 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm'
          : 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-300 text-slate-900 flex items-center gap-1 shadow-sm';
      }
      if (kmEl) {
        const pct = ((race.personalKm / race.teamKm) * 100).toFixed(1);
        kmEl.innerHTML = race.personalKm.toFixed(1) + ' km <span class="text-[9px] text-slate-400 font-normal">/ ' + race.teamKm.toLocaleString('vi-VN') + ' km (' + pct + '%)</span>';
      }
      if (counterEl) counterEl.innerText = (currentRaceIdx + 1) + ' / ' + userRacesData.length;

      // Update dots
      const dots = document.getElementById('carousel-dots');
      if (dots) {
        dots.innerHTML = userRacesData.map((_, i) => {
          return '<span class="h-2 rounded-full cursor-pointer transition ' + (i === currentRaceIdx ? 'bg-[#FF5B26] w-4' : 'bg-slate-300 w-2') + '" onclick="setRaceSlide(' + i + ')"></span>';
        }).join('');
      }
    }

    function prevRaceSlide() {
      currentRaceIdx = (currentRaceIdx - 1 + userRacesData.length) % userRacesData.length;
      renderRaceSlide();
    }

    function nextRaceSlide() {
      currentRaceIdx = (currentRaceIdx + 1) % userRacesData.length;
      renderRaceSlide();
    }

    function setRaceSlide(idx) {
      if (idx >= 0 && idx < userRacesData.length) {
        currentRaceIdx = idx;
        renderRaceSlide();
      }
    }

    async function quickSyncStrava() {
      const spinner = document.getElementById('sync-spinner');
      if (spinner) spinner.classList.add('animate-spin');
      try {
        const res = await fetch('/api/me/strava-sync', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          completedWeeklyKm = data.newCompletedKm || (completedWeeklyKm + 2.5);
          updateWeeklyProgressUi();
          
          // Add newly synced activity to table
          const syncedAct = {
            id: 'act-strava-' + Date.now(),
            title: '🏃 Chạy sáng Strava Sync ven hồ Tây',
            athlete: 'Nguyễn Văn A',
            dist: 2.5,
            time: 12.5,
            paceStr: '5:00',
            gain: 15,
            valid: true,
            bonus: 0,
            finalKm: 2.5,
            reason: '',
            appealStatus: 'NONE'
          };
          liveActivities.unshift(syncedAct);
          renderActivities();

          const syncTimeEl = document.getElementById('strava-last-sync-time');
          if (syncTimeEl) {
            const now = new Date();
            syncTimeEl.innerText = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + now.toLocaleDateString('vi-VN');
          }

          showToast('Đã đồng bộ thành công bài chạy mới từ Strava (+2.5 km)!');
        }
      } catch (err) {
        console.error('Strava sync error:', err);
        showToast('Đồng bộ Strava hoàn tất!');
      } finally {
        if (spinner) spinner.classList.remove('animate-spin');
      }
    }

    function updateWeeklyProgressUi() {
      const compEl = document.getElementById('cycle-completed-km');
      const targetEl = document.getElementById('cycle-target-km');
      const barEl = document.getElementById('cycle-progress-bar');
      const pctEl = document.getElementById('cycle-percent');
      const bannerEl = document.getElementById('section-1-3');
      const missingKmEl = document.getElementById('penalty-missing-km');

      const remaining = Math.max(0, targetWeeklyKm - completedWeeklyKm);
      const pct = Math.min(100, (completedWeeklyKm / targetWeeklyKm) * 100).toFixed(1);

      if (compEl) compEl.innerText = completedWeeklyKm.toFixed(1);
      if (targetEl) targetEl.innerText = targetWeeklyKm.toFixed(1);
      if (pctEl) pctEl.innerText = pct + '%';
      if (barEl) {
        barEl.style.width = pct + '%';
        if (completedWeeklyKm >= targetWeeklyKm) {
          barEl.className = 'bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-inner';
        }
      }

      if (bannerEl && missingKmEl) {
        if (remaining <= 0) {
          bannerEl.className = 'text-[11px] text-emerald-800 bg-emerald-50/90 p-3 rounded-2xl border border-emerald-300 flex items-center justify-between shadow-sm';
          bannerEl.innerHTML = '<div class="flex items-center gap-1.5 font-bold"><span class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-200 text-emerald-900">[1.3] AN TOÀN</span><span>✓ Bạn đã hoàn thành chỉ tiêu tuần, không bị phạt!</span></div>';
        } else {
          missingKmEl.innerText = remaining.toFixed(1) + ' km';
        }
      }
    }

    function compensateRunNow() {
      openAddActModal();
      const distInput = document.getElementById('act-input-dist');
      const titleInput = document.getElementById('act-input-title');
      const timeInput = document.getElementById('act-input-time');
      if (distInput) distInput.value = '1.5';
      if (titleInput) titleInput.value = 'Chạy bù hoàn thành chỉ tiêu tuần';
      if (timeInput) timeInput.value = '8.5';
    }

    function openJoinRaceModal() {
      const modal = document.getElementById('join-race-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeJoinRaceModal() {
      const modal = document.getElementById('join-race-modal');
      const fb = document.getElementById('join-modal-feedback');
      if (modal) modal.classList.add('hidden');
      if (fb) fb.classList.add('hidden');
    }

    function switchJoinTab(tab) {
      const btnCode = document.getElementById('join-tab-code-btn');
      const btnQr = document.getElementById('join-tab-qr-btn');
      const viewCode = document.getElementById('join-view-code');
      const viewQr = document.getElementById('join-view-qr');

      if (tab === 'code') {
        btnCode.className = 'flex-1 py-1.5 text-xs font-bold rounded-xl bg-white text-slate-900 shadow-sm transition';
        btnQr.className = 'flex-1 py-1.5 text-xs font-bold rounded-xl text-slate-500 hover:text-slate-900 transition';
        viewCode.classList.remove('hidden');
        viewQr.classList.add('hidden');
      } else {
        btnQr.className = 'flex-1 py-1.5 text-xs font-bold rounded-xl bg-white text-slate-900 shadow-sm transition';
        btnCode.className = 'flex-1 py-1.5 text-xs font-bold rounded-xl text-slate-500 hover:text-slate-900 transition';
        viewQr.classList.remove('hidden');
        viewCode.classList.add('hidden');
      }
    }

    function setJoinSampleCode(code) {
      const input = document.getElementById('join-code-input');
      if (input) input.value = code;
    }

    async function submitJoinCode() {
      const input = document.getElementById('join-code-input');
      const code = input ? input.value.trim() : '';
      if (!code) {
        alert('Vui lòng nhập mã mời giải chạy!');
        return;
      }
      try {
        const res = await fetch('/api/races/join-by-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        const data = await res.json();
        const fb = document.getElementById('join-modal-feedback');
        if (fb) {
          fb.classList.remove('hidden');
          if (data.success) {
            fb.className = 'p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs';
            fb.innerHTML = '<strong>✓ GIA NHẬP THÀNH CÔNG!</strong> ' + data.message;
            if (data.race && !userRacesData.some(r => r.raceId === data.race.raceId)) {
              userRacesData.push({
                raceId: data.race.raceId,
                name: data.race.name,
                slug: data.race.slug,
                club: data.race.club,
                team: data.race.team,
                standing: data.race.teamStandingLabel || '#1 Dẫn đầu',
                badge: data.race.badgeColor || 'gold',
                personalKm: data.race.personalContributedKm || 0.0,
                teamKm: data.race.teamTotalKm || 50.0
              });
              currentRaceIdx = userRacesData.length - 1;
              renderRaceSlide();
            }
            showToast('Gia nhập giải thành công!');
            setTimeout(closeJoinRaceModal, 1500);
          } else {
            fb.className = 'p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs';
            fb.innerHTML = '<strong>✕ LỖI:</strong> ' + data.message;
          }
        }
      } catch (err) {
        console.error('Join error:', err);
      }
    }

    function simulateQrScanSuccess() {
      setJoinSampleCode('OR-8K2Q');
      switchJoinTab('code');
      submitJoinCode();
    }

    function openProrateModal() {
      const modal = document.getElementById('prorate-info-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeProrateModal() {
      const modal = document.getElementById('prorate-info-modal');
      if (modal) modal.classList.add('hidden');
    }
`;

if (!content.includes('function renderRaceSlide()')) {
  content = content.replace(target, functionsJs + '\n' + target);
  fs.writeFileSync(mainPath, content, 'utf8');
  console.log('Successfully inserted Subsystem 1 functions into main.ts!');
} else {
  console.log('Already present.');
}

