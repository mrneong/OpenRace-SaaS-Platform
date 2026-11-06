const fs = require('fs');
const path = require('path');

const mainPath = path.resolve(__dirname, '../workspace/backend/src/main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

// 1. ADD API ROUTES FOR CRUD, MEMBER MANAGEMENT, APPROVALS, RACE SETUP
const apiAnchor = `          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }`;

const newCrudRoutes = `
    // [6.2] Member Management: Add Member
    const clubAddMemberMatch = pathname.match(/^\\/api\\/clubs\\/([^\\/]+)\\/members$/);
    if (req.method === 'POST' && clubAddMemberMatch) {
      const slug = clubAddMemberMatch[1];
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const newMember = clubHubUseCase.addMember(slug, payload);
          res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, member: newMember }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }

    // [6.2] Member Management: Update / Delete Member
    const clubUpdateMemberMatch = pathname.match(/^\\/api\\/clubs\\/([^\\/]+)\\/members\\/([^\\/]+)$/);
    if (req.method === 'PUT' && clubUpdateMemberMatch) {
      const slug = clubUpdateMemberMatch[1];
      const memberId = clubUpdateMemberMatch[2];
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const updated = clubHubUseCase.updateMember(slug, memberId, payload);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, member: updated }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }

    if (req.method === 'DELETE' && clubUpdateMemberMatch) {
      const slug = clubUpdateMemberMatch[1];
      const memberId = clubUpdateMemberMatch[2];
      const deleted = clubHubUseCase.deleteMember(slug, memberId);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: deleted }));
      return true;
    }

    // [6.1] Club Settings: Update Info & VietQR Bank
    const clubSettingsMatch = pathname.match(/^\\/api\\/clubs\\/([^\\/]+)$/);
    if (req.method === 'PUT' && clubSettingsMatch) {
      const slug = clubSettingsMatch[1];
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const updated = clubHubUseCase.updateClubSettings(slug, payload);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, club: updated }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }

    // [7.1] Race Management: Create Race
    if (req.method === 'POST' && pathname === '/api/races') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const newRace = adminUseCase.createRace(payload);
          res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, race: newRace }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }

    // [7.3] Appeals Review: Approve with Credited KM or Reject
    const appealReviewMatch = pathname.match(/^\\/api\\/appeals\\/([^\\/]+)\\/review$/);
    if (req.method === 'POST' && appealReviewMatch) {
      const appealId = appealReviewMatch[1];
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const reviewed = adminUseCase.reviewAppeal(
            appealId,
            'admin-chief-01',
            payload.status || 'APPROVED',
            payload.creditedKm,
            payload.note
          );
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, appeal: reviewed }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }

    // [5.1] Profile: Update
    if (req.method === 'PUT' && pathname === '/api/me/profile') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, profile: payload, message: 'Đã cập nhật hồ sơ cá nhân thành công' }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return true;
    }`;

if (!content.includes('/api/clubs/:slug/members') && !content.includes('clubAddMemberMatch')) {
  // Find the clubJoinMatch closing
  const joinIdx = content.indexOf('clubJoinMatch');
  if (joinIdx !== -1) {
    const nextBrace = content.indexOf('return true;\n    }', joinIdx);
    if (nextBrace !== -1) {
      const targetPoint = nextBrace + 'return true;\n    }'.length;
      content = content.substring(0, targetPoint) + '\n' + newCrudRoutes + content.substring(targetPoint);
      console.log('Successfully injected CRUD API routes!');
    }
  }
}

fs.writeFileSync(mainPath, content, 'utf8');
console.log('Patch step 1 complete.');

