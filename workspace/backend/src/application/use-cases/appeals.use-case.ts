/**
 * Appeals & Manual Adjustment Use Case (TypeScript)
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import type { EvaluationResult } from '../../domain/models/models';

export class AppealsUseCase {
  private readonly store: InMemoryDataStore;

  constructor(store: InMemoryDataStore) {
    this.store = store;
  }

  submitAppeal(raceId: string, userId: string, activityId: string, reason: string) {
    return this.store.createAppeal(raceId, userId, activityId, reason);
  }

  approveAndOverride(appealId: string, adminId: string, reason: string): EvaluationResult {
    const appeal = this.store.approveAppeal(appealId, adminId, reason);
    const activity = this.store.getActivity(appeal.activityId);
    if (!activity) {
      throw new Error(`Activity ${appeal.activityId} not found`);
    }

    this.store.addManualAdjustment(
      appeal.raceId,
      appeal.userId,
      appeal.activityId,
      'override_valid',
      reason,
      adminId
    );

    const distanceKm = activity.distanceM / 1000.0;
    const overriddenLog: EvaluationResult = {
      activityId: activity.id,
      raceId: appeal.raceId,
      userId: appeal.userId,
      isValid: true,
      rawDistanceKm: distanceKm,
      bonusDistanceKm: 0.0,
      finalDistanceKm: distanceKm,
      startAt: activity.startAt,
      localDate: activity.startAt.toISOString().split('T')[0],
    };

    this.store.saveEvaluationLog(overriddenLog);
    return overriddenLog;
  }

  /**
   * [Enterprise Layer II.1] Multi-Tier Dispute & Appeal Submission with Evidence
   */
  submitMultiTierAppeal(raceId: string, userId: string, activityId: string, reason: string, evidenceUrl?: string) {
    const appeal = this.store.createAppeal(raceId, userId, activityId, reason);
    (appeal as any).captainStatus = 'PENDING';
    (appeal as any).tier = 1;
    appeal.evidenceUrl = evidenceUrl || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&auto=format&fit=crop';
    return appeal;
  }

  /**
   * [Enterprise Layer II.1] Captain Tier-1 Endorsement
   */
  captainEndorseAppeal(appealId: string, captainId: string, endorsementNote: string) {
    const appeal = this.store.appeals.get(appealId);
    if (!appeal) throw new Error(`Appeal ${appealId} not found`);
    (appeal as any).captainStatus = 'ENDORSED';
    (appeal as any).captainId = captainId;
    (appeal as any).captainNote = endorsementNote;
    (appeal as any).tier = 2; // Escalated to Super Admin
    return appeal;
  }
}
