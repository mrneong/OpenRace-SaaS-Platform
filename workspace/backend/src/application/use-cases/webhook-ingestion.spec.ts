/**
 * Jest Integration Tests for Strava Webhook Ingestion (AC-011)
 */

import { WebhookIngestionUseCase } from './webhook-ingestion.use-case';
import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';

export function runWebhookIngestionTests(runner: any) {
  runner.test('AC-011: Fast Acknowledgment and Event Queuing', () => {
    const store = new InMemoryDataStore();
    const useCase = new WebhookIngestionUseCase(store);

    const payload = {
      aspect_type: 'create',
      event_time: 1730700000,
      object_id: 99887766,
      object_type: 'activity',
      owner_id: 112233,
      subscription_id: 1,
    };

    const res = useCase.ingestStravaEvent(payload);
    runner.expect(res.status).toBe('ACKNOWLEDGED');
    runner.expect(res.elapsedMs < 2000).toBe(true);
    runner.expect(store.webhookEvents.length).toBe(1);

    // Kiểm tra Idempotent (khử trùng lặp)
    const dupRes = useCase.ingestStravaEvent(payload);
    runner.expect(store.webhookEvents.length).toBe(1);
    runner.expect(dupRes.eventId).toBe(res.eventId);
  });
}

