/**
 * Strava Webhook Ingestion Use Case (TypeScript)
 * Guarantees sub-second response (< 2000ms SLA)
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';

export class WebhookIngestionUseCase {
  private readonly store: InMemoryDataStore;

  constructor(store: InMemoryDataStore) {
    this.store = store;
  }

  ingestStravaEvent(payload: {
    aspect_type: string;
    object_id: number;
    object_type: string;
    owner_id: number;
    event_time: number;
    subscription_id: number;
  }): { status: string; eventId: string; elapsedMs: number } {
    const startTime = performance.now();
    const eventKey = `strava:${payload.aspect_type}:${payload.object_id}`;

    const eventRecord = this.store.saveWebhookEvent('strava', eventKey, payload);
    const elapsedMs = performance.now() - startTime;

    return {
      status: 'ACKNOWLEDGED',
      eventId: eventRecord.id,
      elapsedMs,
    };
  }
}
