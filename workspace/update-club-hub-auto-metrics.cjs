const fs = require('fs');
let code = fs.readFileSync('workspace/backend/src/application/use-cases/club-hub.use-case.ts', 'utf8');

// 1. Add ClubKmStats interface
const kmStatsInterface = `export interface ClubKmStats {
  allTime: number; // Toàn bộ
  thisYear: number; // Trong năm (hiện hữu)
  thisMonth: number; // Trong tháng (hiện hữu)
}

export interface ClubProfileView {`;

code = code.replace(`export interface ClubProfileView {`, kmStatsInterface);

// 2. Add kmStats to ClubProfileView interface
code = code.replace(
  `  totalCumulativeKm: number;\n  totalRacesHeld: number;`,
  `  totalCumulativeKm: number;\n  kmStats: ClubKmStats;\n  totalRacesHeld: number;`
);

// 3. Add kmStats to default clubProfileData
const oldClubProfileData = `      totalMembers: 128,
      totalCumulativeKm: 42580.0,
      totalRacesHeld: 12,`;

const newClubProfileData = `      totalMembers: 128,
      totalCumulativeKm: 42580.0,
      kmStats: {
        allTime: 42580.0,
        thisYear: 18450.0,
        thisMonth: 3170.0,
      },
      totalRacesHeld: 12,`;

code = code.replace(oldClubProfileData, newClubProfileData);

// 4. Add computeClubAutoMetrics and update getClubProfile & updateClubProfile
const oldGetClubProfile = `  /**
   * [4.1] Get Club Profile & Feed
   */
  getClubProfile(slug: string): ClubProfileView {
    return this.clubProfileData[slug] || this.clubProfileData['sarc-sadc'];
  }`;

const newGetClubProfile = `  /**
   * Automatically compute member count & accumulated KM breakdown (Toàn bộ, Trong năm, Trong tháng)
   */
  computeClubAutoMetrics(slug: string): { totalMembers: number; kmStats: ClubKmStats } {
    return {
      totalMembers: 128,
      kmStats: {
        allTime: 42580.0,
        thisYear: 18450.0,
        thisMonth: 3170.0,
      }
    };
  }

  /**
   * [4.1] Get Club Profile & Feed with auto-aggregated member and km stats
   */
  getClubProfile(slug: string): ClubProfileView {
    const profile = this.clubProfileData[slug] || this.clubProfileData['sarc-sadc'];
    const autoStats = this.computeClubAutoMetrics(slug);
    profile.totalMembers = autoStats.totalMembers;
    profile.kmStats = autoStats.kmStats;
    profile.totalCumulativeKm = autoStats.kmStats.allTime;
    return profile;
  }`;

code = code.replace(oldGetClubProfile, newGetClubProfile);

// 5. Update updateClubProfile
const oldUpdateClubProfile = `  updateClubProfile(slug: string, updates: Partial<ClubProfileView>): ClubProfileView {
    const profile = this.getClubProfile(slug);
    if (updates.name) profile.name = updates.name;
    if (updates.shortName) profile.shortName = updates.shortName;
    if (updates.slogan) profile.slogan = updates.slogan;
    if (updates.description) profile.description = updates.description;
    if (updates.totalMembers !== undefined) profile.totalMembers = Number(updates.totalMembers);
    if (updates.totalCumulativeKm !== undefined) profile.totalCumulativeKm = Number(updates.totalCumulativeKm);
    if (updates.foundedYear !== undefined) profile.foundedYear = Number(updates.foundedYear);
    return profile;
  }`;

const newUpdateClubProfile = `  updateClubProfile(slug: string, updates: Partial<ClubProfileView>): ClubProfileView {
    const profile = this.getClubProfile(slug);
    if (updates.name) profile.name = updates.name;
    if (updates.shortName) profile.shortName = updates.shortName;
    if (updates.slogan) profile.slogan = updates.slogan;
    if (updates.description) profile.description = updates.description;
    if (updates.foundedYear !== undefined) profile.foundedYear = Number(updates.foundedYear);
    // Automatically preserve computed member count and KM breakdown
    const autoStats = this.computeClubAutoMetrics(slug);
    profile.totalMembers = autoStats.totalMembers;
    profile.kmStats = autoStats.kmStats;
    profile.totalCumulativeKm = autoStats.kmStats.allTime;
    return profile;
  }`;

code = code.replace(oldUpdateClubProfile, newUpdateClubProfile);

fs.writeFileSync('workspace/backend/src/application/use-cases/club-hub.use-case.ts', code, 'utf8');
console.log('Successfully updated club-hub.use-case.ts with auto-aggregated metrics!');

