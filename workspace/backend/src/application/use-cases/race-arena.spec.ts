/**
 * Acceptance Tests for Subsystem [2.0] Race Arena & Leaderboard
 * Verifies AC-Arena-2.1 through AC-Arena-2.5
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { RaceArenaUseCase } from './race-arena.use-case';

export function runRaceArenaTests(runner: any): void {
  const dataStore = new InMemoryDataStore();
  const arenaUseCase = new RaceArenaUseCase(dataStore);

  // [2.1] Hero Banner & Race Countdown
  runner.test('AC-Arena-2.1: Hero Banner & Race Countdown Metrics', () => {
    const hero = arenaUseCase.getRaceHero('season-10-run-to-techcombank');
    runner.expect(hero.slug).toBe('season-10-run-to-techcombank');
    runner.expect(hero.status).toBe('running');
    runner.expect(hero.totalAthletes).toBe(48);
    runner.expect(hero.totalKm).toBe(3170.0);
    runner.expect(hero.totalValidPersonDays).toBe(348);
    runner.expect(hero.topReward.title).toBe('Áo thi đấu CLB SARC độc bản 2026');
  });

  // [2.2] Team Leaderboard (Rank 1 & Tied Rank 2)
  runner.test('AC-Arena-2.2: Team Leaderboard Computation (Rank 1 vs Tied Rank 2)', () => {
    const lb = arenaUseCase.getTeamLeaderboard('season-10-run-to-techcombank');
    runner.expect(lb.teams.length).toBe(3);

    const rank1 = lb.teams[0];
    runner.expect(rank1.rank).toBe(1);
    runner.expect(rank1.name).toBe('Team Phoenix SARC');
    runner.expect(rank1.expectedFundFeeVnd).toBe(100000);
    runner.expect(rank1.badge).toBe('gold');

    const rank2A = lb.teams[1];
    runner.expect(rank2A.rank).toBe(2);
    runner.expect(rank2A.rankLabel).toBe('Đồng Hạng 2');
    runner.expect(rank2A.expectedFundFeeVnd).toBe(200000);
    runner.expect(rank2A.badge).toBe('silver');

    const rank2B = lb.teams[2];
    runner.expect(rank2B.rank).toBe(2);
    runner.expect(rank2B.rankLabel).toBe('Đồng Hạng 2');
    runner.expect(rank2B.expectedFundFeeVnd).toBe(200000);
  });

  // [2.3] Individual Leaderboard with Top 1 Reward & Self Row
  runner.test('AC-Arena-2.3: Individual Leaderboard with Top 1 Reward & Self Row', () => {
    const ind = arenaUseCase.getIndividualLeaderboard('season-10-run-to-techcombank', 'user-01');
    runner.expect(ind.runners.length >= 6).toBe(true);

    const top1 = ind.runners[0];
    runner.expect(top1.rank).toBe(1);
    runner.expect(top1.name).toBe('Nguyễn Văn A');
    runner.expect(typeof top1.rewardBadge === 'string').toBe(true);
    runner.expect(top1.isCurrentUser).toBe(true);

    runner.expect(ind.currentUserSummary.userId).toBe('user-01');
  });

  // [2.4] My Team Space
  runner.test('AC-Arena-2.4: My Team Space Details & Roster', () => {
    const myTeam = arenaUseCase.getMyTeamSpace('season-10-run-to-techcombank', 'user-01');
    runner.expect(myTeam.teamName).toBe('Team Phoenix SARC');
    runner.expect(myTeam.rank).toBe(1);
    runner.expect(myTeam.members.length >= 5).toBe(true);
    runner.expect(myTeam.members[0].role).toBe('Captain');
    runner.expect(myTeam.teamInviteCode).toBe('PHOENIX-SARC-TEAM');
  });

  // [2.5] Live Stream Broadcast Event
  runner.test('AC-Arena-2.5: SSE Live Stream Event Structure', () => {
    let receivedData: string[] = [];
    const mockRes = {
      write: (data: string) => { receivedData.push(data); },
    };

    arenaUseCase.addStreamClient('season-10-run-to-techcombank', mockRes);
    runner.expect(receivedData.length >= 1).toBe(true); // initial snapshot
    runner.expect(receivedData[0].includes('snapshot')).toBe(true);

    arenaUseCase.broadcastLiveEvent('season-10-run-to-techcombank', {
      type: 'activity_verified',
      athleteName: 'Nguyễn Văn A',
      teamName: 'Team Phoenix SARC',
      distanceKm: 5.2,
      message: 'Nguyễn Văn A vừa hoàn thành bài chạy 5.2 km (+5.2 km)',
      timestamp: new Date().toISOString(),
    });

    runner.expect(receivedData.length >= 2).toBe(true);
    runner.expect(receivedData[1].includes('activity_verified')).toBe(true);

    arenaUseCase.removeStreamClient('season-10-run-to-techcombank', mockRes);
  });
}

