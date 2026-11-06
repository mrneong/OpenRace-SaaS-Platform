/**
 * Jest Unit Tests for Scoring & Leaderboard Engine (AC-009)
 */

import { computeTeamScore, rankTeams } from './scoring-leaderboard';

export function runScoringLeaderboardTests(runner: any) {
  runner.test('AC-009: Team Score Computation with Distance Ratio and Capped Diligent Days', () => {
    const maxKm = 1250.0;

    // Team A: totalKm 1250, teamDays 118 -> dist = 10.0, diligent = 10 * 118/140 = 8.43, total = 18.4
    const scoresA = computeTeamScore(1250.0, maxKm, 118, 140);
    runner.expect(scoresA.scoreDistance).toBe(10.0);
    runner.expect(scoresA.scoreDiligent).toBe(8.43);
    runner.expect(scoresA.totalScore).toBe(18.4);

    // Team B: totalKm 1000, teamDays 150 (cap 140) -> dist = 8.0, diligent = 10.0, total = 18.0
    const scoresB = computeTeamScore(1000.0, maxKm, 150, 140);
    runner.expect(scoresB.scoreDistance).toBe(8.0);
    runner.expect(scoresB.scoreDiligent).toBe(10.0);
    runner.expect(scoresB.totalScore).toBe(18.0);

    const teams = [
      { teamId: 'team-b', name: 'Team B', totalKm: 1000.0, teamDays: 150, scores: scoresB },
      { teamId: 'team-a', name: 'Team A', totalKm: 1250.0, teamDays: 118, scores: scoresA },
    ];

    const ranked = rankTeams(teams, 'top1_then_tied_second');
    runner.expect(ranked[0].name).toBe('Team A');
    runner.expect(ranked[0].rank).toBe(1);
    runner.expect(ranked[0].rankLabel).toBe('Hạng 1');

    runner.expect(ranked[1].name).toBe('Team B');
    runner.expect(ranked[1].rank).toBe(2);
    runner.expect(ranked[1].rankLabel).toBe('Đồng hạng 2');
  });
}

