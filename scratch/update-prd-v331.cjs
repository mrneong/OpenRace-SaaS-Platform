const fs = require('fs');

const prd = JSON.parse(fs.readFileSync('shared_context/PRD.json', 'utf8'));
prd.version = 'v3.31.0-PROD';
prd.updated_at = new Date().toISOString();

// Mark previous ACs as completed
prd.acceptance_criteria.forEach(ac => {
  if (ac.id && ac.id.startsWith('AC-FROZEN-HUB-ACTIONS-')) {
    ac.status = 'COMPLETED';
  }
});

prd.acceptance_criteria.push(
  {
    id: 'AC-STRAVA-OAUTH-WEBHOOK-01',
    category: 'Strava OAuth 2.0 Integration & Realtime Webhooks',
    title: 'Strava OAuth 2.0 Authorization Dialog & Granular Permission Consent',
    description: 'When the runner or organizer connects to Strava, provide an interactive OAuth 2.0 authorization dialog (#modal-strava-authorize). It features official Strava branding (#FC4C02), athlete identity verification, and explicit permission grants for required scopes: read, activity:read_all, and profile:read_all, displaying clear scope explanations and consent switches.',
    priority: 'CRITICAL',
    status: 'PLANNED',
    verification: 'Clicking [⚡ Kết Nối Lại Strava] opens #modal-strava-authorize with permission checkboxes for read, activity:read_all, and profile:read_all. Clicking Confirm Authorization saves permissions and transitions connection state.'
  },
  {
    id: 'AC-STRAVA-OAUTH-WEBHOOK-02',
    category: 'Strava OAuth 2.0 Integration & Realtime Webhooks',
    title: '24/7 Real-Time Webhook Connection & Live Event Stream Subscription',
    description: 'Enabling authorization establishes and confirms the real-time webhook connection handshake with the Strava system. Displays live Webhook status (TỰ ĐỘNG WEBHOOK 24/7 - ĐANG LẮNG NGHE), updates the raw webhook ingestion log table in real-time, and fires immediate notification feedback when new activities are received via webhook.',
    priority: 'CRITICAL',
    status: 'PLANNED',
    verification: 'Authorizing connection updates #strava-status-badge to ĐANG KẾT NỐI (ACTIVE), appends live incoming webhook packets to NHẬT KÝ TIẾP NHẬN WEBHOOK STRAVA THÔ, and reflects webhook connectivity 24/7.'
  },
  {
    id: 'AC-SPORT-CAM-PARITY-01',
    category: 'Dual Theme System & Design Parity',
    title: 'Full Docked Sport Cam Sidebar Navigation with 100% Mantis Parity',
    description: 'Build a dedicated docked sidebar for the Sport Cam interface (#sport-docked-sidebar) delivering 100% parity with the Mantis UI navigation tree. Contains all 34 menu items grouped into 3 standardized portals (Vận Động Viên, Câu Lạc Bộ, Ban Tổ Chức & Vận Hành) styled with energetic Sport Cam Orange (#FF5B26) branding, active navigation indicators, and seamless role-based filtering.',
    priority: 'CRITICAL',
    status: 'PLANNED',
    verification: 'Switching to Sport Cam displays a full, docked 260px sidebar with all 34 menu items and categories identical to Mantis UI, fully reactive to role switching.'
  },
  {
    id: 'AC-SPORT-CAM-PARITY-02',
    category: 'Dual Theme System & Design Parity',
    title: 'Sport Cam Header & Dashboard Functional Feature Parity',
    description: 'Ensure the Sport Cam header and dashboard views mirror all Mantis UI capabilities: Ctrl+K search, Dual Theme Switcher Pill (⚡ Sport Cam | 💎 Mantis UI), Wearables direct connect button, Dark mode toggle, Multi-role context switcher dropdown, and full dashboard widgets (KPI cards, performance area chart, streak calendar).',
    priority: 'HIGH',
    status: 'PLANNED',
    verification: 'Both Sport Cam and Mantis UI offer identical interactive capabilities, smooth theme switching without reload, and persistent preferences.'
  }
);

fs.writeFileSync('shared_context/PRD.json', JSON.stringify(prd, null, 2), 'utf8');
console.log('PRD.json updated to v3.31.0-PROD successfully');

