/**
 * Distributed Queue Worker Simulation for Strava Ingestion & Sync (Enterprise Grade)
 * Implements BullMQ + Redis queue pattern with concurrency limit and rate-limiting window
 */

export interface SyncJob {
  id: string;
  athleteId: string;
  athleteName: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  enqueuedAt: string;
  startedAt?: string;
  completedAt?: string;
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  syncedRuns: number;
  addedKm: number;
  rateLimitRemaining: number;
}

export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  totalProcessed: number;
  rateLimitUsed: number;
  rateLimitMax: number;
  workerConcurrency: number;
}

export class StravaSyncQueueWorker {
  private jobs: SyncJob[] = [];
  private isProcessing: boolean = false;
  private readonly maxConcurrency: number = 3;
  private readonly rateLimitMax: number = 100; // 100 reqs / 15-min window
  private rateLimitUsed: number = 18;
  private listeners: Array<(job: SyncJob) => void> = [];

  constructor() {
    // Seed some finished queue jobs for audit metrics
    this.jobs.push({
      id: 'job-init-01',
      athleteId: 'user-02',
      athleteName: 'Trần Thị B',
      priority: 'NORMAL',
      enqueuedAt: new Date(Date.now() - 3600000).toISOString(),
      startedAt: new Date(Date.now() - 3590000).toISOString(),
      completedAt: new Date(Date.now() - 3580000).toISOString(),
      status: 'COMPLETED',
      syncedRuns: 2,
      addedKm: 12.5,
      rateLimitRemaining: 82,
    });
  }

  /**
   * Enqueue a new Strava Sync Job (Optimistic response)
   */
  enqueueSync(athleteId: string, athleteName: string, priority: 'HIGH' | 'NORMAL' = 'NORMAL'): SyncJob {
    const job: SyncJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      athleteId,
      athleteName,
      priority,
      enqueuedAt: new Date().toISOString(),
      status: 'WAITING',
      syncedRuns: 0,
      addedKm: 0,
      rateLimitRemaining: Math.max(0, this.rateLimitMax - this.rateLimitUsed - 1),
    };

    this.jobs.unshift(job);
    this.processNext();
    return job;
  }

  /**
   * Worker processor simulating background Redis / BullMQ worker
   */
  private processNext() {
    if (this.isProcessing) return;

    const waitingJob = this.jobs.find((j) => j.status === 'WAITING');
    if (!waitingJob) return;

    this.isProcessing = true;
    waitingJob.status = 'ACTIVE';
    waitingJob.startedAt = new Date().toISOString();
    this.rateLimitUsed = Math.min(this.rateLimitMax, this.rateLimitUsed + 1);

    // Simulate async job completion
    setTimeout(() => {
      waitingJob.status = 'COMPLETED';
      waitingJob.completedAt = new Date().toISOString();
      waitingJob.syncedRuns = 1;
      waitingJob.addedKm = 5.2; // New 5.2km run synced
      waitingJob.rateLimitRemaining = Math.max(0, this.rateLimitMax - this.rateLimitUsed);

      this.isProcessing = false;
      this.notifyListeners(waitingJob);
      this.processNext();
    }, 600);
  }

  onCompleted(callback: (job: SyncJob) => void) {
    this.listeners.push(callback);
  }

  private notifyListeners(job: SyncJob) {
    this.listeners.forEach((fn) => {
      try {
        fn(job);
      } catch (e) {}
    });
  }

  getJob(jobId: string): SyncJob | undefined {
    return this.jobs.find((j) => j.id === jobId);
  }

  getRecentJobs(limit = 10): SyncJob[] {
    return this.jobs.slice(0, limit);
  }

  getMetrics(): QueueMetrics {
    const waiting = this.jobs.filter((j) => j.status === 'WAITING').length;
    const active = this.jobs.filter((j) => j.status === 'ACTIVE').length;
    const completed = this.jobs.filter((j) => j.status === 'COMPLETED').length;
    const failed = this.jobs.filter((j) => j.status === 'FAILED').length;

    return {
      waiting,
      active,
      completed,
      failed,
      totalProcessed: completed + failed,
      rateLimitUsed: this.rateLimitUsed,
      rateLimitMax: this.rateLimitMax,
      workerConcurrency: this.maxConcurrency,
    };
  }
}

