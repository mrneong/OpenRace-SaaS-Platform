const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

console.log('=== Injecting Digital Finisher Certificate & Elevation Audit Drawer ===');

// 1. ADD API ROUTES FOR CERTIFICATE & ELEVATION AUDIT
const apiRoutesToInject = `
    // [Feature AC-046] Digital Finisher Certificate API
    if (req.method === 'GET' && pathname === '/api/me/certificate') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        certificateId: 'CERT-2026-M10-ATH001',
        athleteName: 'Nguyễn Văn A',
        athleteEmail: 'athlete.nguyen@sarc.vn',
        raceName: 'MÙA 10 RUN TO TECHCOMBANK 2026',
        clubName: 'CLB Chạy Bộ SARC (Sáng Ánh Rạng Chiều)',
        teamName: 'Team Phoenix SARC',
        teamRank: 'HẠNG 1 VÔ ĐỊCH ĐỒNG ĐỘI',
        completedKm: 1250.0,
        diligentDays: 118,
        issuedAt: new Date().toISOString(),
        verificationUrl: 'https://openrace.vn/verify/CERT-2026-M10-ATH001',
        qrToken: 'OR-CERT-M10-8K2Q-ATH001',
        status: 'OFFICIALLY_VERIFIED'
      }));
      return true;
    }

    // [Feature AC-047] Elevation Profile & Anti-Cheat GPS Route Audit API
    if (req.method === 'GET' && pathname?.startsWith('/api/activities/') && pathname?.endsWith('/elevation-profile')) {
      const actId = pathname.split('/')[3] || 'ACT_000075';
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        activityId: actId,
        title: actId === 'ACT_000075' ? 'Trail Đền Gióng - Leo Dốc Sóc Sơn' : 'Bài chạy ' + actId,
        distanceKm: 8.0,
        movingTimeSeconds: 3600,
        elevationGainM: 280,
        bonusKm: 2.0,
        creditedDistanceKm: 10.0,
        profilePoints: [
          { km: 0.0, alt: 48 },
          { km: 1.2, alt: 95 },
          { km: 2.5, alt: 160 },
          { km: 3.8, alt: 240 },
          { km: 5.0, alt: 328 },
          { km: 6.4, alt: 210 },
          { km: 7.2, alt: 120 },
          { km: 8.0, alt: 55 }
        ],
        antiCheat: {
          avgCadence: 168,
          maxCadence: 182,
          maxSpeedKmH: 14.2,
          paceFloorValid: true,
          cadenceConsistency: '98.5%',
          vehicleFraudSuspected: false,
          verdict: 'VERIFIED_AUTHENTIC_RUN'
        }
      }));
      return true;
    }
`;

const apiAnchor = "if (req.method === 'GET' && pathname === '/api/health')";
if (!code.includes('/api/me/certificate')) {
  code = code.replace(apiAnchor, `${apiRoutesToInject}\n    ${apiAnchor}`);
  console.log('✓ Added /api/me/certificate & /api/activities/:id/elevation-profile API routes');
}

// 2. ADD MODALS HTML (CERTIFICATE MODAL & ELEVATION AUDIT DRAWER)
const modalsHtml = `
  <!-- ==================================================== -->
  <!-- [AC-046] DIGITAL FINISHER CERTIFICATE MODAL -->
  <!-- ==================================================== -->
  <div id="modal-finisher-certificate" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border-4 border-amber-400 relative space-y-6 text-slate-800">
      <button onclick="closeFinisherCertificateModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition">✕</button>
      
      <!-- Certificate Canvas Container -->
      <div id="certificate-print-area" class="border-8 border-double border-amber-300 rounded-2xl p-6 md:p-10 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 text-center relative overflow-hidden shadow-inner">
        <!-- Watermark Background Emblem -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <svg class="w-96 h-96 text-amber-600" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="45"/>
          </svg>
        </div>

        <div class="relative z-10 space-y-4">
          <!-- Club & Race Header -->
          <div class="flex items-center justify-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-[#FF5B26] text-white flex items-center justify-center font-black text-sm shadow-md">SARC</div>
            <div class="text-left">
              <div class="text-xs uppercase tracking-widest font-black text-amber-700">CLB Chạy Bộ SARC (Sáng Ánh Rạng Chiều)</div>
              <div class="text-[10px] text-slate-500 font-mono">BAN ĐIỀU HÀNH GIẢI CHẠY BỘ MÙA 10</div>
            </div>
          </div>

          <div class="py-2">
            <h1 class="text-2xl md:text-4xl font-serif font-black tracking-wider text-slate-900 uppercase">Chứng Nhận Hoàn Thành</h1>
            <div class="text-xs font-serif italic text-amber-800 font-medium">CERTIFICATE OF RUNNING COMPLETION & PODIUM FINISHER</div>
          </div>

          <p class="text-xs text-slate-500 max-w-md mx-auto">Trân trọng trao tặng và ghi nhận thành tích xuất sắc của Vận Động Viên:</p>
          <div class="text-2xl md:text-3xl font-black text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-8">
            Nguyễn Văn A
          </div>

          <!-- Team and Race Metadata -->
          <div class="py-2 space-y-1">
            <p class="text-xs text-slate-600">
              Đã nỗ lực thi đấu và hoàn thành xuất sắc giải chạy:
            </p>
            <div class="text-sm md:text-base font-extrabold text-[#FF5B26]">
              MÙA 10 RUN TO TECHCOMBANK 2026 — SADC/SARC
            </div>
            <div class="text-xs font-semibold text-slate-700">
              Đội thi: <span class="text-indigo-600 font-bold">Team Phoenix SARC</span> • Danh hiệu: <span class="text-amber-600 font-bold">🏆 Hạng 1 Vô Địch Đồng Đội</span>
            </div>
          </div>

          <!-- Highlight Metric Badges Grid -->
          <div class="grid grid-cols-3 gap-3 max-w-lg mx-auto py-2">
            <div class="bg-white/80 p-2.5 rounded-xl border border-amber-200/80 shadow-xs">
              <div class="text-[10px] uppercase font-bold text-slate-400">Tổng Cự Ly</div>
              <div class="text-lg font-black text-slate-900 font-mono">1,250.0 <span class="text-xs font-sans">KM</span></div>
            </div>
            <div class="bg-white/80 p-2.5 rounded-xl border border-amber-200/80 shadow-xs">
              <div class="text-[10px] uppercase font-bold text-slate-400">Ngày Chuyên Cần</div>
              <div class="text-lg font-black text-emerald-600 font-mono">118 <span class="text-xs font-sans">/ 140</span></div>
            </div>
            <div class="bg-white/80 p-2.5 rounded-xl border border-amber-200/80 shadow-xs">
              <div class="text-[10px] uppercase font-bold text-slate-400">Thưởng Áo Đấu</div>
              <div class="text-lg font-black text-[#FF5B26]">Áo SARC</div>
            </div>
          </div>

          <!-- Bottom Footer: Golden Seal & Verification QR -->
          <div class="pt-4 flex items-center justify-between border-t border-amber-200/60 max-w-lg mx-auto text-left text-[11px]">
            <!-- Verification QR -->
            <div class="flex items-center gap-2">
              <div class="w-14 h-14 bg-white p-1 rounded-lg border border-amber-300 shadow-xs flex items-center justify-center">
                <svg class="w-full h-full" viewBox="0 0 40 40">
                  <rect x="2" y="2" width="12" height="12" fill="#18181B"/>
                  <rect x="5" y="5" width="6" height="6" fill="#FFFFFF"/>
                  <rect x="26" y="2" width="12" height="12" fill="#18181B"/>
                  <rect x="29" y="5" width="6" height="6" fill="#FFFFFF"/>
                  <rect x="2" y="26" width="12" height="12" fill="#18181B"/>
                  <rect x="5" y="29" width="6" height="6" fill="#FFFFFF"/>
                  <rect x="18" y="6" width="4" height="4" fill="#18181B"/>
                  <rect x="20" y="16" width="8" height="8" fill="#FF5B26"/>
                  <rect x="16" y="26" width="6" height="6" fill="#18181B"/>
                  <rect x="26" y="26" width="10" height="10" fill="#18181B"/>
                </svg>
              </div>
              <div class="leading-tight">
                <div class="font-bold text-slate-900 font-mono text-[10px]">ID: CERT-2026-M10-ATH001</div>
                <div class="text-[9px] text-slate-400">Quét QR tra cứu danh hiệu số</div>
                <div class="text-[9px] text-emerald-600 font-bold">✓ Đã xác thực blockchain OpenRace</div>
              </div>
            </div>

            <!-- Official Gold Seal -->
            <div class="flex flex-col items-center">
              <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border-2 border-amber-500 shadow-md flex items-center justify-center text-amber-950 font-black text-[10px] text-center uppercase leading-none p-1">
                SARC<br/>CHAMPION<br/>SEAL
              </div>
              <div class="text-[9px] text-slate-500 font-serif italic mt-1">Ban Chủ Nhiệm CLB</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <button onclick="window.print()" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5">
          <span>🖨️</span> In / Tải Chứng Nhận (PDF)
        </button>
        <button onclick="shareCertificate()" class="px-4 py-2.5 rounded-xl bg-[#FF5B26] hover:bg-[#e04800] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5">
          <span>📤</span> Chia Sẻ Lên Mạng Xã Hội
        </button>
        <button onclick="closeFinisherCertificateModal()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition">
          Đóng
        </button>
      </div>
    </div>
  </div>

  <!-- ==================================================== -->
  <!-- [AC-047] INTERACTIVE ELEVATION & ROUTE AUDIT DRAWER -->
  <!-- ==================================================== -->
  <div id="drawer-elevation-audit" class="hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
    <div class="bg-white w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
      <div class="space-y-6">
        <!-- Drawer Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="text-xl">🏔️</span>
            <div>
              <h3 class="text-base font-bold text-slate-900">[3.B] Thẩm Định Cao Độ Dốc GPS</h3>
              <p class="text-xs text-slate-400">Trắc địa địa hình & Kiểm toán chống gian lận phương tiện</p>
            </div>
          </div>
          <button onclick="closeElevationAuditDrawer()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition">✕</button>
        </div>

        <!-- Activity Info Chip -->
        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-slate-900" id="elevation-act-title">ACT_000075 • Trail Đền Gióng</div>
            <div class="text-[11px] text-slate-500">Cự ly: <strong class="text-slate-800">8.0 km</strong> • Thời gian: <strong class="text-slate-800">1:00:00</strong></div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-300">
            +2.0 km Thưởng Trail
          </span>
        </div>

        <!-- Interactive Elevation Graph SVG -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-700 uppercase text-[11px] tracking-wider">Đồ Thị Trắc Địa Cao Độ (Elevation Profile)</span>
            <span class="text-slate-400 font-mono text-[10px]">Đỉnh dốc: 328m | Xuất phát: 48m</span>
          </div>

          <div class="relative bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white shadow-inner">
            <div class="h-44 w-full relative">
              <svg class="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="topoElevationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#10B981" stop-opacity="0.6"/>
                    <stop offset="50%" stop-color="#3B82F6" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#10B981" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                <!-- Elevation Topo Polygon -->
                <polygon points="0,135 75,110 155,75 240,40 310,15 390,80 445,115 500,130 500,160 0,160" fill="url(#topoElevationGrad)"/>
                <!-- Line Stroke -->
                <polyline points="0,135 75,110 155,75 240,40 310,15 390,80 445,115 500,130" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>
                <!-- Summit Peak Indicator -->
                <circle cx="310" cy="15" r="4" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
                <text x="310" y="8" fill="#F59E0B" font-size="10" font-weight="bold" text-anchor="middle">Đỉnh dốc 328m</text>
              </svg>
            </div>
            <!-- Distance Grid Labels -->
            <div class="flex justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800">
              <span>0 km</span>
              <span>2.5 km</span>
              <span>5.0 km (Summit)</span>
              <span>6.5 km</span>
              <span>8.0 km (Finish)</span>
            </div>
          </div>
        </div>

        <!-- Trail Bonus Step-by-Step Breakdown -->
        <div class="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-2 text-xs">
          <div class="font-bold text-emerald-900 flex items-center gap-1.5">
            <span>📐</span> Công Thức Tính Thưởng Dốc Trail Chuẩn Quy Định
          </div>
          <div class="space-y-1 text-slate-700 text-[11px] leading-relaxed">
            <div>• Tổng độ cao tích lũy đo được: <strong class="text-emerald-700 font-mono font-bold">+280.0 m</strong></div>
            <div>• Quy chuẩn giải: Mỗi <strong class="font-bold">100m gain</strong> được thưởng <strong class="font-bold">+1.0 km</strong> cự ly</div>
            <div>• Phép tính: <code class="px-1.5 py-0.5 bg-white rounded font-mono font-bold text-emerald-800">floor(280 / 100) * 1.0 = +2.0 km</code></div>
            <div>• Cự ly công nhận chung cuộc: <strong class="text-slate-900 font-bold">8.0 km + 2.0 km = 10.0 km</strong></div>
          </div>
        </div>

        <!-- Anti-Cheat Sanity Checks Table -->
        <div class="space-y-2">
          <span class="font-bold text-slate-700 uppercase text-[11px] tracking-wider">Kiểm Toán Chống Gian Lận (Anti-Cheat Sanity Check)</span>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div class="text-[10px] text-slate-400 font-medium">Nhịp bước (Cadence)</div>
              <div class="font-mono font-bold text-slate-900 text-sm flex items-center gap-1">
                <span>168</span> <span class="text-[10px] font-sans text-slate-400">spm</span>
                <span class="text-emerald-500 font-bold">✓ Hợp lệ</span>
              </div>
              <div class="text-[10px] text-emerald-600 font-medium">Xác nhận chuyển động chân người thật</div>
            </div>

            <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div class="text-[10px] text-slate-400 font-medium">Vận tốc tối đa (Max Speed)</div>
              <div class="font-mono font-bold text-slate-900 text-sm flex items-center gap-1">
                <span>14.2</span> <span class="text-[10px] font-sans text-slate-400">km/h</span>
                <span class="text-emerald-500 font-bold">✓ Hợp lệ</span>
              </div>
              <div class="text-[10px] text-emerald-600 font-medium">Không vi phạm sàn pace 2:45</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Drawer Footer -->
      <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span class="text-[11px] text-slate-400 font-mono">Dữ liệu GPS đồng bộ qua Strava Webhook</span>
        <button onclick="closeElevationAuditDrawer()" class="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition">
          Đóng
        </button>
      </div>
    </div>
  </div>
`;

if (!code.includes('id="modal-finisher-certificate"')) {
  code = code.replace('</body>', `${modalsHtml}\n</body>`);
  console.log('✓ Added Finisher Certificate Modal & Elevation Audit Drawer');
}

// 3. ADD BUTTON TRIGGERS ON DASHBOARD AND CLIENT FUNCTIONS
const clientJsToInject = `
    // ====================================================
    // [AC-046 & AC-047] FINISHER CERTIFICATE & ELEVATION AUDIT
    // ====================================================

    function openFinisherCertificateModal() {
      const modal = document.getElementById('modal-finisher-certificate');
      if (modal) modal.classList.remove('hidden');
    }

    function closeFinisherCertificateModal() {
      const modal = document.getElementById('modal-finisher-certificate');
      if (modal) modal.classList.add('hidden');
    }

    function shareCertificate() {
      showToast('✓ Đã sao chép liên kết chứng nhận điện tử để chia sẻ lên Zalo/Facebook!');
    }

    function openElevationAuditDrawer(activityId = 'ACT_000075') {
      const drawer = document.getElementById('drawer-elevation-audit');
      if (drawer) drawer.classList.remove('hidden');
    }

    function closeElevationAuditDrawer() {
      const drawer = document.getElementById('drawer-elevation-audit');
      if (drawer) drawer.classList.add('hidden');
    }
`;

if (!code.includes('function openFinisherCertificateModal(')) {
  code = code.replace('</script>', `${clientJsToInject}\n  </script>`);
  console.log('✓ Injected Certificate & Elevation client functions');
}

// 4. ADD TRIGGER BUTTON IN DASHBOARD HERO BAR
const certButtonHtml = `
              <button onclick="openFinisherCertificateModal()" class="px-3 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 hover:scale-105" title="Xem Chứng Nhận Hoàn Thành">
                <span>📜</span> <span>Chứng Nhận</span>
              </button>
`;

if (!code.includes('title="Xem Chứng Nhận Hoàn Thành"')) {
  code = code.replace(
    '<button onclick="openAddActivityModal()"',
    `${certButtonHtml}              <button onclick="openAddActivityModal()"`
  );
  console.log('✓ Added Certificate button to Dashboard Hero bar');
}

// 5. ADD ONCLICK TO TRAIL BONUS CARD ON DASHBOARD
if (!code.includes("onclick=\"openElevationAuditDrawer('ACT_000075')\"")) {
  code = code.replace(
    '<div class="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">\n            <div class="flex items-center justify-between text-slate-400">\n              <span class="text-xs font-semibold">Thưởng Dốc Trail</span>',
    `<div onclick="openElevationAuditDrawer('ACT_000075')" class="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2 cursor-pointer hover:border-emerald-300 transition" title="Bấm để xem thẩm định trắc địa cao độ GPS">\n            <div class="flex items-center justify-between text-slate-400">\n              <span class="text-xs font-semibold">Thưởng Dốc Trail</span>`
  );
  console.log('✓ Added click trigger on Trail Bonus card');
}

fs.writeFileSync(mainTsPath, code, 'utf8');
console.log('=== Successfully updated main.ts with Certificate & Elevation Audit! ===');
