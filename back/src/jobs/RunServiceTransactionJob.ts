import ServiceTransactionServiceFactory from '../modules/lifeops/factory/services/ServiceTransactionServiceFactory.js';

interface RunServiceTransactionJobOptions {
    intervalMs?: number;
    runOnStart?: boolean;
}

interface ServiceTransactionJobScheduler {
    stop: () => Promise<void>;
}

const DEFAULT_RUN_SERVICE_TRANSACTION_JOB_OPTIONS: Required<RunServiceTransactionJobOptions> = {
    intervalMs: 60_000,
    runOnStart: true
};

let scheduler: ServiceTransactionJobScheduler | null = null;

function currentServicePeriod(date = new Date()): string {
    const parts = new Intl.DateTimeFormat('en', {
        timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit'
    }).formatToParts(date);
    return `${parts.find(part => part.type === 'year')!.value}-${parts.find(part => part.type === 'month')!.value}`;
}

// Keep this scheduler in the API process: MongoDB's recurring-write queue is process-local.
function RunServiceTransactionJob(options: RunServiceTransactionJobOptions = {}): ServiceTransactionJobScheduler {
    if (scheduler) return scheduler;

    const environmentInterval = Number(process.env.SERVICE_TRANSACTION_INTERVAL_MS);
    const intervalMs = options.intervalMs
        ?? (Number.isFinite(environmentInterval) && environmentInterval > 0 ? environmentInterval : undefined)
        ?? DEFAULT_RUN_SERVICE_TRANSACTION_JOB_OPTIONS.intervalMs;
    if (!Number.isFinite(intervalMs) || intervalMs <= 0) throw new Error('Service transaction interval must be positive');
    const runOnStart = options.runOnStart ?? (process.env.SERVICE_TRANSACTION_RUN_ON_START !== 'false');
    let running: Promise<void> | undefined;
    let stopped = false;

    const tick = () => {
        if (stopped || running) return;
        running = (async () => {
            const period = currentServicePeriod();
            try {
                const transactions = await ServiceTransactionServiceFactory.instance.generate(period);
                console.log('[service-transaction] scheduler tick finished', {period, transactions: transactions.length});
            } catch (error) {
                console.error('[service-transaction] scheduler tick failed', {period, error});
            }
        })().finally(() => { running = undefined; });
    };

    const interval = setInterval(tick, intervalMs);
    const instance: ServiceTransactionJobScheduler = {
        stop: async () => {
            stopped = true;
            clearInterval(interval);
            await running;
            if (scheduler === instance) scheduler = null;
        }
    };
    scheduler = instance;
    console.log('[service-transaction] scheduler started', {intervalMs, runOnStart});
    if (runOnStart) tick();
    return instance;
}

const StartServiceTransactionJob = RunServiceTransactionJob;
export default RunServiceTransactionJob;
export {RunServiceTransactionJob, StartServiceTransactionJob, currentServicePeriod, DEFAULT_RUN_SERVICE_TRANSACTION_JOB_OPTIONS};
export type {RunServiceTransactionJobOptions, ServiceTransactionJobScheduler};
