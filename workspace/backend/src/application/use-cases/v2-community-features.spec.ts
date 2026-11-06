/**
 * Unit Test Suite for V2 Features:
 * - [AC-035] Strava Self-Service Disconnect / Reconnect
 * - [AC-036] Strava Ingestion & Raw Sync Logs
 * - [AC-037] 3 Race Scopes (Internal, Community, Designated) & Capacity Lock
 * - [AC-038] Race Whitelist Management
 * - [AC-039] Team Leader Identity Management
 * - [AC-040] 2-Way Friendship Network
 * - [AC-041] Community Feed, Kudos Engagement & Comments
 * - [AC-042] Multi-Criteria Rule Engine Weighted Scoring
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { V2CommunityFeaturesUseCase } from './v2-community-features.use-case';

export function runV2CommunityFeaturesTests(runner: any) {
  runner.suite('V2 Community & Advanced Operations Features (AC-035 to AC-042)', () => {
    let store: InMemoryDataStore;
    let useCase: V2CommunityFeaturesUseCase;

    const setup = () => {
      store = new InMemoryDataStore();
      useCase = new V2CommunityFeaturesUseCase(store);
    };

    // [AC-035] Strava Self-Service Disconnect / Reconnect
    runner.test('AC-035: Strava Self-Service Disconnect / Reconnect', () => {
      setup();

      // Seed 2 activities in store for user-01
      store.activities.set('act-1', {
        id: 'act-1',
        userId: 'user-01',
        stravaActivityId: 'str-1',
        sportType: 'Run',
        startAt: new Date(),
        elapsedTimeS: 1800,
        movingTimeS: 1800,
        distanceM: 5000,
        elevationGainM: 20,
        status: 'active',
      });

      // Disconnect
      const res = useCase.disconnectStrava('user-01');
      runner.expect(res.success).toBe(true);
      runner.expect(res.status).toBe('REVOKED');
      runner.expect(res.preservedRunsCount >= 1).toBe(true);

      // Verify connection status in useCase
      const status = useCase.getStravaStatus('user-01');
      runner.expect(status.status).toBe('REVOKED');

      // Verify historic runs preserved
      runner.expect(store.activities.has('act-1')).toBe(true);

      // Reconnect
      const reRes = useCase.reconnectStrava('user-01');
      runner.expect(reRes.success).toBe(true);
      runner.expect(reRes.status).toBe('ACTIVE');
    });

    // [AC-036] Strava Ingestion & Raw Sync Logs
    runner.test('AC-036: Strava Ingestion & Raw Sync Logs', () => {
      setup();

      const logs = useCase.getStravaSyncLogs('user-01');
      runner.expect(logs.length >= 3).toBe(true);
      runner.expect(logs[0].httpStatusCode).toBe(200);

      // Log new event
      const newLog = useCase.logSyncEvent({
        userId: 'user-01',
        syncSource: 'webhook',
        stravaActivityId: 99887766,
        httpStatusCode: 200,
        status: 'processed',
        rawEventPayload: { test: true },
      });
      runner.expect(newLog.status).toBe('processed');

      const updatedLogs = useCase.getStravaSyncLogs('user-01');
      runner.expect(updatedLogs[0].stravaActivityId).toBe(99887766);
    });

    // [AC-037] 3 Race Scopes & Capacity Lock
    runner.test('AC-037: 3 Race Scopes & Capacity Lock', () => {
      setup();

      // 1. Internal race: club member succeeds, non-club fails
      const joinInternalPass = useCase.joinRaceV2('user-03', 'user3@sarc.vn', 'season-10-internal', ['club-sarc-sadc']);
      runner.expect(joinInternalPass.success).toBe(true);

      let errorMsg = '';
      try {
        useCase.joinRaceV2('user-stranger', 'stranger@gmail.com', 'season-10-internal', ['club-other']);
      } catch (err: any) {
        errorMsg = err.message;
      }
      runner.expect(errorMsg.includes('INTERNAL_ONLY')).toBe(true);

      // 2. Capacity lock: community-open-5k has maxParticipants=2 (1 already seeded)
      const joinComm1 = useCase.joinRaceV2('user-c1', 'c1@gmail.com', 'community-open-5k', []);
      runner.expect(joinComm1.success).toBe(true);

      let capError = '';
      try {
        useCase.joinRaceV2('user-c2', 'c2@gmail.com', 'community-open-5k', []);
      } catch (err: any) {
        capError = err.message;
      }
      runner.expect(capError.includes('CAPACITY_REACHED')).toBe(true);
    });

    // [AC-038] Race Whitelist Management
    runner.test('AC-038: Race Whitelist Management for Designated Races', () => {
      setup();

      // Join with whitelisted email
      const joinPass = useCase.joinRaceV2('user-01', 'athlete.nguyen@sarc.vn', 'designated-elite-invitational', []);
      runner.expect(joinPass.success).toBe(true);

      // Join with non-whitelisted email
      let errorWl = '';
      try {
        useCase.joinRaceV2('user-unknown', 'stranger@nowhere.com', 'designated-elite-invitational', []);
      } catch (err: any) {
        errorWl = err.message;
      }
      runner.expect(errorWl.includes('NOT_WHITELISTED')).toBe(true);

      // Add to whitelist
      useCase.addWhitelist('designated-elite-invitational', ['stranger@nowhere.com']);
      const joinAfterWl = useCase.joinRaceV2('user-unknown', 'stranger@nowhere.com', 'designated-elite-invitational', []);
      runner.expect(joinAfterWl.success).toBe(true);
    });

    // [AC-039] Team Leader Identity Management
    runner.test('AC-039: Team Leader Identity Management', () => {
      setup();

      // Leader updates team
      const updated = useCase.updateTeamIdentity('team-phoenix', 'user-01', {
        name: 'Chiến Binh Phoenix Vàng',
        slogan: 'Không gì là không thể',
      });
      runner.expect(updated.name).toBe('Chiến Binh Phoenix Vàng');
      runner.expect(updated.slogan).toBe('Không gì là không thể');

      // Non-leader fails
      let errPerm = '';
      try {
        useCase.updateTeamIdentity('team-phoenix', 'user-intruder', { name: 'Hack Team' });
      } catch (err: any) {
        errPerm = err.message;
      }
      runner.expect(errPerm.includes('FORBIDDEN')).toBe(true);
    });

    // [AC-040] 2-Way Friendship Network
    runner.test('AC-040: 2-Way Friendship Network', () => {
      setup();

      // User 1 & 2 are already seeded friends
      const friends1 = useCase.getFriends('user-01');
      runner.expect(friends1.includes('user-02')).toBe(true);

      // User 1 sends request to User 3
      const req = useCase.sendFriendRequest('user-01', 'user-03');
      runner.expect(req.status).toBe('pending');

      // User 3 accepts
      const accepted = useCase.respondFriendRequest('user-01', 'user-03', true);
      runner.expect(accepted.status).toBe('accepted');

      const friendsAfter = useCase.getFriends('user-01');
      runner.expect(friendsAfter.includes('user-03')).toBe(true);
    });

    // [AC-041] Community Feed, Kudos & Comments
    runner.test('AC-041: Community Feed, Kudos & Comments', () => {
      setup();

      // Feed check
      const allFeed = useCase.getFeed('user-01', 'all');
      runner.expect(allFeed.length >= 1).toBe(true);

      // Create new post
      const newPost = useCase.createPost('user-01', 'Nguyễn Văn A', {
        caption: 'Hôm nay chạy 10km sáng sớm mát mẻ!',
        distanceKm: 10.0,
        pace: '5:00 min/km',
      });
      runner.expect(newPost.caption.includes('10km')).toBe(true);

      // Kudos toggle
      const kudosRes1 = useCase.kudosPost(newPost.id, 'user-02');
      runner.expect(kudosRes1.kudosCount).toBe(1);
      runner.expect(kudosRes1.liked).toBe(true);

      // Comment
      const comment = useCase.commentPost(newPost.id, 'user-02', 'Trần Thị B', 'Chúc mừng bạn chạy nhé!');
      runner.expect(comment.content).toBe('Chúc mừng bạn chạy nhé!');
      runner.expect(newPost.commentCount).toBe(1);
    });

    // [AC-042] Multi-Criteria Rule Engine Weighted Scoring
    runner.test('AC-042: Multi-Criteria Rule Engine Weighted Scoring', () => {
      setup();

      const ranked = useCase.computeMultiCriteriaLeaderboard('season-10-internal', {
        distance: 0.4,
        diligentDays: 0.3,
        elevationGain: 0.2,
        paceQuality: 0.1,
      });

      runner.expect(ranked.length).toBe(3);
      runner.expect(ranked[0].rank).toBe(1);
      runner.expect(ranked[0].name).toBe('Team Phoenix SARC');
      runner.expect(ranked[0].scores.totalScore > 0).toBe(true);
      runner.expect(ranked[1].rank).toBe(2);
      runner.expect(ranked[2].rank).toBe(2); // Tied rank 2
    });
  });
}
