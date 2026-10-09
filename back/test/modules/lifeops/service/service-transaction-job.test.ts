import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import RunServiceTransactionJob, {currentServicePeriod} from '../../../../src/jobs/RunServiceTransactionJob.js';
import type {ServiceTransactionJobScheduler} from '../../../../src/jobs/RunServiceTransactionJob.js';
import ServiceTransactionServiceFactory from '../../../../src/modules/lifeops/factory/services/ServiceTransactionServiceFactory.js';


describe('RunServiceTransactionJob', () => {
    let scheduler: ServiceTransactionJobScheduler | undefined;
    const generate = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-10-09T12:00:00Z'));
        generate.mockReset().mockResolvedValue([]);
        vi.spyOn(ServiceTransactionServiceFactory, 'instance', 'get').mockReturnValue({generate} as any);
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.stubEnv('SERVICE_TRANSACTION_INTERVAL_MS', '');
        vi.stubEnv('SERVICE_TRANSACTION_RUN_ON_START', '');
    });

    afterEach(async () => {
        await scheduler?.stop();
        scheduler = undefined;
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it('uses the Command Center timezone at month/year boundaries', () => {
        expect(currentServicePeriod(new Date('2027-01-01T02:59:59Z'))).toBe('2026-12');
        expect(currentServicePeriod(new Date('2027-01-01T03:00:00Z'))).toBe('2027-01');
    });

    it('generates the current month on start and returns a singleton scheduler', async () => {
        scheduler = RunServiceTransactionJob();
        expect(RunServiceTransactionJob()).toBe(scheduler);
        expect(generate).toHaveBeenCalledExactlyOnceWith('2026-10');
        await vi.advanceTimersByTimeAsync(60_000);
        expect(generate).toHaveBeenCalledTimes(2);
    });

    it('rechecks the month on each interval and discovers services added after startup', async () => {
        scheduler = RunServiceTransactionJob({intervalMs: 1_000, runOnStart: false});
        expect(generate).not.toHaveBeenCalled();
        vi.setSystemTime(new Date('2026-10-31T23:59:59-03:00'));
        await vi.advanceTimersByTimeAsync(1_000);
        expect(generate).toHaveBeenCalledExactlyOnceWith('2026-11');
        await vi.advanceTimersByTimeAsync(1_000);
        expect(generate).toHaveBeenCalledTimes(2);
    });

    it('skips overlapping ticks and waits for the in-flight run on stop', async () => {
        let complete!: (items: never[]) => void;
        generate.mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }));
        scheduler = RunServiceTransactionJob({intervalMs: 1_000});
        await vi.advanceTimersByTimeAsync(3_000);
        expect(generate).toHaveBeenCalledTimes(1);
        let stopped = false;
        const stop = scheduler.stop().then(() => { stopped = true; });
        await Promise.resolve();
        expect(stopped).toBe(false);
        complete([]);
        await stop;
        expect(stopped).toBe(true);
        await vi.advanceTimersByTimeAsync(3_000);
        expect(generate).toHaveBeenCalledTimes(1);
    });

    it('logs failures and retries on the next tick', async () => {
        generate.mockRejectedValueOnce(new Error('Database unavailable'));
        scheduler = RunServiceTransactionJob({intervalMs: 1_000});
        await vi.advanceTimersByTimeAsync(1_000);
        expect(console.error).toHaveBeenCalledWith('[service-transaction] scheduler tick failed', expect.objectContaining({period: '2026-10'}));
        expect(generate).toHaveBeenCalledTimes(2);
    });

    it('can stop and restart without a stale stop cancelling the new scheduler', async () => {
        scheduler = RunServiceTransactionJob({runOnStart: false});
        const old = scheduler;
        await old.stop();
        scheduler = RunServiceTransactionJob({intervalMs: 1_000, runOnStart: false});
        expect(scheduler).not.toBe(old);
        await old.stop();
        expect(RunServiceTransactionJob()).toBe(scheduler);
        await vi.advanceTimersByTimeAsync(1_000);
        expect(generate).toHaveBeenCalledTimes(1);
    });

    it('supports the same environment option pattern as other recurring jobs', async () => {
        vi.stubEnv('SERVICE_TRANSACTION_INTERVAL_MS', '2000');
        vi.stubEnv('SERVICE_TRANSACTION_RUN_ON_START', 'false');
        scheduler = RunServiceTransactionJob();
        expect(generate).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1_999);
        expect(generate).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1);
        expect(generate).toHaveBeenCalledExactlyOnceWith('2026-10');
    });

    it('falls back from an invalid environment interval and rejects invalid explicit intervals', async () => {
        expect(() => RunServiceTransactionJob({intervalMs: 0})).toThrow('interval must be positive');
        vi.stubEnv('SERVICE_TRANSACTION_INTERVAL_MS', 'invalid');
        scheduler = RunServiceTransactionJob({runOnStart: false});
        await vi.advanceTimersByTimeAsync(60_000);
        expect(generate).toHaveBeenCalledExactlyOnceWith('2026-10');
    });
});
