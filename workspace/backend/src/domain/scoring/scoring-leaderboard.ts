/**
 * Team Scoring & Leaderboard Engine (TypeScript)
 */

import type { TeamScore, RankedTeam } from '../models/models';

export function computeTeamScore(
  teamKm: number,
  maxTeamKm: number,
  teamDays: number,
  capDays = 140
): TeamScore {
  const scoreDistance = maxTeamKm <= 0 ? 0 : 10.0 * (teamKm / maxTeamKm);
  const scoreDiligent = 10.0 * (Math.min(teamDays, capDays) / capDays);
  const totalScore = Math.round((scoreDistance + scoreDiligent) * 10) / 10;

  return {
    scoreDistance: Math.round(scoreDistance * 100) / 100,
    scoreDiligent: Math.round(scoreDiligent * 100) / 100,
    totalScore,
  };
}

export function computeMultiCriteriaTeamScore(
  teamKm: number,
  maxTeamKm: number,
  teamDays: number,
  capDays: number,
  teamGainM: number,
  maxTeamGainM: number,
  validRunsCount: number,
  weights = { distance: 0.4, diligentDays: 0.3, elevationGain: 0.2, paceQuality: 0.1 }
): TeamScore {
  const normDist = maxTeamKm <= 0 ? 0 : 10.0 * (teamKm / maxTeamKm);
  const normDays = 10.0 * (Math.min(teamDays, capDays) / capDays);
  const normGain = maxTeamGainM <= 0 ? 0 : 10.0 * Math.min(1.0, teamGainM / maxTeamGainM);
  const normPace = Math.min(10.0, validRunsCount * 0.2);

  const totalScore = Math.round(
    (normDist * weights.distance +
     normDays * weights.diligentDays +
     normGain * weights.elevationGain +
     normPace * weights.paceQuality) * 10
  ) / 10;

  return {
    scoreDistance: Math.round(normDist * 100) / 100,
    scoreDiligent: Math.round(normDays * 100) / 100,
    totalScore,
  };
}

export function rankTeams(
  teams: Array<{ teamId: string; name: string; totalKm: number; teamDays: number; scores: TeamScore }>,
  rankingPolicy = 'top1_then_tied_second'
): RankedTeam[] {
  if (!teams || teams.length === 0) return [];

  // Sắp xếp giảm dần theo totalScore, tie-break theo totalKm, rồi teamDays
  const sorted = [...teams].sort((a, b) => {
    if (b.scores.totalScore !== a.scores.totalScore) {
      return b.scores.totalScore - a.scores.totalScore;
    }
    if (b.totalKm !== a.totalKm) {
      return b.totalKm - a.totalKm;
    }
    return b.teamDays - a.teamDays;
  });

  return sorted.map((team, index) => {
    if (rankingPolicy === 'top1_then_tied_second') {
      return {
        ...team,
        rank: index === 0 ? 1 : 2,
        rankLabel: index === 0 ? 'Hạng 1' : 'Đồng hạng 2',
      };
    }
    return {
      ...team,
      rank: index + 1,
      rankLabel: `Hạng ${index + 1}`,
    };
  });
}
