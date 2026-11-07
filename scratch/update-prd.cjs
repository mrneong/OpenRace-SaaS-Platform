const fs = require('fs');
const prd = JSON.parse(fs.readFileSync('shared_context/PRD.json', 'utf8'));
prd.version = 'v3.30.0-PROD';
prd.updated_at = new Date().toISOString();

// Mark previous ACs completed
prd.acceptance_criteria.forEach(ac => {
  if (ac.id && ac.id.startsWith('AC-RACE-WIZARD-EDIT-')) {
    ac.status = 'COMPLETED';
  }
});

prd.acceptance_criteria.push(
  {
    id: 'AC-FROZEN-HUB-ACTIONS-01',
    category: 'Tournament Operations & Historical Archive',
    title: 'Unified Landing and Frozen Hall of Fame Modal (Bang Vang and E-Cert)',
    description: 'Implement openRaceLandingModal(slugOrId) globally and create a dedicated interactive modal #modal-frozen-hall-of-fame. For frozen or archived tournaments (such as Mua 9 Thu Thach Mua He Ruc Lua), clicking "Xem Bang Vang and E-Cert" opens the Hall of Fame modal showcasing the immutable ledger signature (LEDGER-SIG-M9-FROZEN-8F9B2C), total distance (15,420 km), disbursed cash prizes (15.000.000d), champion team (Team Dragons SADC), and detailed recipient roster with individual certificate identifiers. For active tournaments, it safely falls back to openRaceLandingPageModal.',
    priority: 'CRITICAL',
    status: 'PLANNED',
    verification: 'Clicking "Xem Bang Vang and E-Cert" on Mua 9 card displays #modal-frozen-hall-of-fame with correct ledger signature and recipient roster without throwing ReferenceError.'
  },
  {
    id: 'AC-FROZEN-HUB-ACTIONS-02',
    category: 'Tournament Operations & Reporting',
    title: 'Actual Excel/CSV Report Generation and Browser Download Stream',
    description: 'Implement backend endpoint GET /api/races/:id/download-report returning an RFC 4180 / Excel-compatible CSV file with UTF-8 BOM (\uFEFF) and attachment Content-Disposition. Update exportRaceExcel(raceId) in the browser to trigger a real file download via programmatic anchor click, supporting all active and frozen tournaments (race-season-9, race-spring-2026, race-season-10, race-trail-bavi).',
    priority: 'CRITICAL',
    status: 'PLANNED',
    verification: 'Clicking "Xuat Bao Cao Toan Giai" or "Xuat Bao Cao Luu Tru" initiates an immediate browser download of the race CSV/Excel file with status 200.'
  },
  {
    id: 'AC-FROZEN-HUB-ACTIONS-03',
    category: 'Tournament Operations & Historical Archive',
    title: 'Hall of Fame to Finisher Certificate Dynamic Preview Integration',
    description: 'Provide two-way modal synergy between the Frozen Hall of Fame modal and the Digital Finisher Certificate modal #modal-finisher-certificate. Each recipient in the Hall of Fame roster has an actionable "Xem E-Cert" button that dynamically populates and renders their official electronic certificate with personalized runner name, BIB, category, rank, and security seal.',
    priority: 'HIGH',
    status: 'PLANNED',
    verification: 'Clicking "Xem E-Cert" inside the Hall of Fame modal opens #modal-finisher-certificate displaying the selected runner details.'
  }
);

fs.writeFileSync('shared_context/PRD.json', JSON.stringify(prd, null, 2), 'utf8');
console.log('PRD.json updated to v3.30.0-PROD successfully');
