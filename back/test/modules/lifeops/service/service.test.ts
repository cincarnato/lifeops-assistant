import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Fastify from 'fastify';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mongoose, ForbiddenError, UnauthorizedError } from '@drax/common-back';
import ServiceSqliteRepository from '../../../../src/modules/lifeops/repository/sqlite/ServiceSqliteRepository.js';
import ServiceTransactionSqliteRepository from '../../../../src/modules/lifeops/repository/sqlite/ServiceTransactionSqliteRepository.js';
import ServiceMongoRepository from '../../../../src/modules/lifeops/repository/mongo/ServiceMongoRepository.js';
import ServiceTransactionMongoRepository from '../../../../src/modules/lifeops/repository/mongo/ServiceTransactionMongoRepository.js';
import { ServiceModel } from '../../../../src/modules/lifeops/models/ServiceModel.js';
import { ServiceTransactionModel } from '../../../../src/modules/lifeops/models/ServiceTransactionModel.js';
import ServiceService from '../../../../src/modules/lifeops/services/ServiceService.js';
import ServiceTransactionService from '../../../../src/modules/lifeops/services/ServiceTransactionService.js';
import ServiceServiceFactory from '../../../../src/modules/lifeops/factory/services/ServiceServiceFactory.js';
import ServiceTransactionServiceFactory from '../../../../src/modules/lifeops/factory/services/ServiceTransactionServiceFactory.js';
import BusinessPartnerServiceFactory from '../../../../src/modules/lifeops/factory/services/BusinessPartnerServiceFactory.js';
import ServiceRoutes from '../../../../src/modules/lifeops/routes/ServiceRoutes.js';
import ServiceTransactionRoutes from '../../../../src/modules/lifeops/routes/ServiceTransactionRoutes.js';
import type { IServiceBase } from '../../../../src/modules/lifeops/interfaces/IService.js';

for (const engine of ['SQLite', 'MongoDB'] as const) {
    describe(`Service and ServiceTransaction (${engine})`, { concurrency: false }, () => {
        let serviceRepository: any;
        let transactionRepository: any;
        let services: ServiceService;
        let transactions: ServiceTransactionService;
        let directory: string;
        let mongoServer: MongoMemoryServer;
        const partnerId = '507f1f77bcf86cd799439011';
        const factories = [ServiceServiceFactory, ServiceTransactionServiceFactory, BusinessPartnerServiceFactory];
        let previous: any[];

        before(async () => {
            previous = factories.map(factory => (factory as any).service);
            if (engine === 'SQLite') {
                directory = mkdtempSync(join(tmpdir(), 'lifeops-service-'));
                const file = join(directory, 'test.sqlite');
                serviceRepository = new ServiceSqliteRepository(file);
                serviceRepository.build();
                serviceRepository.db.exec('CREATE TABLE BusinessPartner (_id TEXT PRIMARY KEY, name TEXT NOT NULL)');
                serviceRepository.db.prepare('INSERT INTO BusinessPartner VALUES (?, ?)').run(partnerId, 'Partner');
                transactionRepository = new ServiceTransactionSqliteRepository(file);
                transactionRepository.build();
            } else {
                mongoServer = await MongoMemoryServer.create();
                await mongoose.connect(mongoServer.getUri());
                serviceRepository = new ServiceMongoRepository();
                transactionRepository = new ServiceTransactionMongoRepository();
                await Promise.all([ServiceModel.init(), ServiceTransactionModel.init()]);
                await mongoose.connection.collection('BusinessPartner').insertOne({ _id: new mongoose.Types.ObjectId(partnerId), name: 'Partner' });
            }
            services = new ServiceService(serviceRepository);
            transactions = new ServiceTransactionService(transactionRepository);
            (ServiceServiceFactory as any).service = services;
            (ServiceTransactionServiceFactory as any).service = transactions;
            (BusinessPartnerServiceFactory as any).service = {
                findById: async (id: string) => id === partnerId ? { _id: partnerId, name: 'Partner' } : null
            };
        });
        beforeEach(async () => {
            if (engine === 'SQLite') {
                await transactionRepository.deleteAll();
                await serviceRepository.deleteAll();
            } else {
                await ServiceTransactionModel.deleteMany({});
                await ServiceModel.deleteMany({});
            }
        });
        after(async () => {
            factories.forEach((factory, index) => (factory as any).service = previous?.[index]);
            if (engine === 'SQLite') {
                serviceRepository?.db.close();
                transactionRepository?.db.close();
                if (directory) rmSync(directory, { recursive: true, force: true });
            } else {
                await mongoose.disconnect();
                await mongoServer?.stop();
            }
        });

        const createService = (extra: Partial<IServiceBase> = {}) => services.create({
            name: 'Service', businessPartner: partnerId, type: 'INCOME', amount: 100, frequency: 'MONTHLY', ...extra
        });

        it('validates inputs and refs, applies create defaults, and populates all service details', async () => {
            const service = await createService();
            assert.equal(service.active, true);
            const transaction = await transactions.create({ service: service._id, period: '2026-01' });
            assert.equal(transaction.amount, 100);
            assert.equal(transaction.status, 'PENDING');
            assert.equal(transaction.paidAt, null);
            assert.deepEqual(transaction.service, service);
            await assert.rejects(createService({ amount: -1 }));
            await assert.rejects(createService({ businessPartner: '507f1f77bcf86cd799439012' }));
            await assert.rejects(transactions.create({ service: service._id, period: '2026-13' }));
            await assert.rejects(transactions.create({ service: service._id, period: '2026-02', amount: -1 }));
            await assert.rejects(transactions.create({ service: '507f1f77bcf86cd799439012', period: '2026-02' }));
            await assert.rejects(transactions.create({ service: service._id, period: '2026-02', paidAt: new Date() } as any));
        });

        it('generates January-anchored cadence, excludes inactive/on-demand, and is idempotent', async () => {
            for (const frequency of ['MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'YEARLY', 'ON_DEMAND'] as const) {
                await createService({ name: frequency, frequency });
            }
            await createService({ active: false });
            const counts = [4, 1, 2, 2, 2, 1, 3, 1, 2, 2, 2, 1];
            for (let month = 1; month <= 12; month++) {
                const period = `2026-${String(month).padStart(2, '0')}`;
                const first = await transactions.generate(period);
                const second = await transactions.generate(period);
                assert.equal(first.length, counts[month - 1]);
                assert.deepEqual(second.map(item => item._id), first.map(item => item._id));
            }
        });

        it('serializes concurrent generation and manual writes without recurring duplicates', async () => {
            const service = await createService();
            const results = await Promise.allSettled([
                transactions.generate('2026-01'), transactions.generate('2026-01'),
                ...Array.from({ length: 4 }, () => transactions.create({ service: service._id, period: '2026-01' }))
            ]);
            assert.equal((await transactions.monthly('2026-01')).transactions.length, 1);
            assert.equal(results.filter(result => result.status === 'fulfilled').length >= 2, true);
            const second = await transactions.create({ service: service._id, period: '2026-02' });
            await assert.rejects(transactions.updatePartial(second._id, { period: '2026-01' } as any));
            const another = await createService();
            const otherTransaction = await transactions.create({ service: another._id, period: '2026-01' });
            await assert.rejects(transactions.updatePartial(otherTransaction._id, { service: service._id } as any));
        });

        it('prevents concurrent updates into the same recurring period', async () => {
            const service = await createService();
            const first = await transactions.create({ service: service._id, period: '2026-01' });
            const second = await transactions.create({ service: service._id, period: '2026-02' });
            const results = await Promise.allSettled([
                transactions.updatePartial(first._id, { period: '2026-03' } as any),
                transactions.updatePartial(second._id, { period: '2026-03' } as any)
            ]);
            assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
            assert.equal((await transactions.monthly('2026-03')).transactions.length, 1);
        });

        it('serializes concurrent moves from different services into one destination', async () => {
            const firstService = await createService();
            const secondService = await createService();
            const destination = await createService();
            const first = await transactions.create({ service: firstService._id, period: '2026-01', amount: 35, status: 'PAID' });
            const second = await transactions.create({ service: secondService._id, period: '2026-02', amount: 45 });
            const results = await Promise.allSettled([
                transactions.updatePartial(first._id, { service: destination._id, period: '2026-03' } as any),
                transactions.updatePartial(second._id, { service: destination._id, period: '2026-03' } as any)
            ]);
            assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
            const moved = (await transactions.monthly('2026-03')).transactions;
            assert.equal(moved.length, 1);
            const original = moved[0]._id === first._id ? first : second;
            assert.equal(moved[0].amount, original.amount);
            assert.equal(moved[0].status, original.status);
            assert.equal(moved[0].paidAt?.getTime(), original.paidAt?.getTime());
            assert.equal((await transactions.findById(first._id))._id, first._id);
            assert.equal((await transactions.findById(second._id))._id, second._id);
        });

        it('serializes frequency changes against concurrent duplicate creates in either order', async () => {
            for (const reverse of [false, true]) {
                const service = await createService({ frequency: 'ON_DEMAND' });
                await transactions.create({ service: service._id, period: '2026-01' });
                const operations = [
                    () => services.updatePartial(service._id, { frequency: 'MONTHLY' } as any),
                    () => transactions.create({ service: service._id, period: '2026-01' })
                ];
                if (reverse) operations.reverse();
                const results = await Promise.allSettled(operations.map(operation => operation()));
                assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
                const current = await services.findById(service._id);
                const items = await transactions.findBy('service', service._id, 0);
                assert.equal(items.length, current.frequency === 'ON_DEMAND' ? 2 : 1);
            }
        });

        if (engine === 'MongoDB') {
            it('shares the write queue across repository instances and recovers after rejection', async () => {
                const anotherService = new ServiceService(new ServiceMongoRepository());
                const order: string[] = [];
                let release: () => void;
                const gate = new Promise<void>(resolve => { release = resolve; });
                const first = services.withWriteLock(async () => {
                    order.push('first');
                    await gate;
                    throw new Error('Expected failure');
                });
                const rejected = assert.rejects(first, /Expected failure/);
                const second = anotherService.withWriteLock(async () => { order.push('second'); });
                try {
                    await new Promise(resolve => setImmediate(resolve));
                    assert.deepEqual(order, ['first']);
                } finally { release(); }
                await Promise.all([rejected, second]);
                assert.deepEqual(order, ['first', 'second']);
            });
        }

        it('allows repeated on-demand periods and rejects conversion to recurring with duplicates', async () => {
            const service = await createService({ frequency: 'ON_DEMAND' });
            await Promise.all(Array.from({ length: 3 }, () => transactions.create({ service: service._id, period: '2026-01' })));
            assert.equal((await transactions.monthly('2026-01')).transactions.length, 3);
            assert.equal((await transactions.generate('2026-01')).length, 0);
            await assert.rejects(services.updatePartial(service._id, { frequency: 'MONTHLY' } as any));
        });

        it('manages payment transitions and preserves payment/default fields on amount-only PATCH', async () => {
            const service = await createService({ active: false });
            await services.updatePartial(service._id, { amount: 120 } as any);
            assert.equal((await services.findById(service._id)).active, false);
            const transaction = await transactions.create({ service: service._id, period: '2026-01', amount: 45 });
            const beforePayment = Date.now();
            const paid = await transactions.updatePartial(transaction._id, { status: 'PAID' } as any);
            assert.equal(paid.status, 'PAID');
            assert.ok(paid.paidAt.getTime() >= beforePayment);
            const patched = await transactions.updatePartial(transaction._id, { amount: 60 } as any);
            assert.equal(patched.status, 'PAID');
            assert.equal(patched.paidAt.getTime(), paid.paidAt.getTime());
            const stillPaid = await transactions.updatePartial(transaction._id, { status: 'PAID' } as any);
            assert.equal(stillPaid.paidAt.getTime(), paid.paidAt.getTime());
            await assert.rejects(transactions.updatePartial(transaction._id, { paidAt: null } as any));
            const pending = await transactions.updatePartial(transaction._id, { status: 'PENDING' } as any);
            assert.equal(pending.paidAt, null);
            assert.equal(pending.amount, 60);
            const createdPaid = await transactions.create({ service: service._id, period: '2026-02', status: 'PAID' });
            assert.ok(createdPaid.paidAt instanceof Date);
            assert.equal(createdPaid.amount, 120);
        });

        it('summarizes actual amounts and does not generate on GET', async () => {
            const income = await createService();
            const expense = await createService({ type: 'EXPENSE', frequency: 'ON_DEMAND' });
            assert.equal((await transactions.monthly('2026-01')).transactions.length, 0);
            await transactions.create({ service: income._id, period: '2026-01', amount: 20, status: 'PAID' });
            const pendingIncome = await createService({ frequency: 'ON_DEMAND' });
            await transactions.create({ service: pendingIncome._id, period: '2026-01', amount: 11 });
            await transactions.create({ service: expense._id, period: '2026-01', amount: 7, status: 'PAID' });
            await transactions.create({ service: expense._id, period: '2026-01', amount: 3 });
            await services.updatePartial(income._id, { amount: 999 } as any);
            const { transactions: items, ...summary } = await transactions.monthly('2026-01');
            assert.deepEqual(summary, { expectedIncome: 31, collectedIncome: 20, pendingIncome: 11,
                expectedExpenses: 10, paidExpenses: 7, pendingExpenses: 3 });
            assert.equal(items[0].service.businessPartner.name, 'Partner');
            assert.equal((await transactions.monthly('2026-02')).transactions.length, 0);
        });

        it('exposes authorized Zod-schema routes with partial PATCH and read-only monthly', async () => {
            const app = Fastify({ logger: false });
            app.addHook('onRequest', async (request: any) => {
                const permissions = String(request.headers['x-permissions'] ?? '').split(',');
                const assertPermissions = (required: string[]) => {
                    if (!request.headers['x-permissions']) throw new UnauthorizedError();
                    if (!required.some(permission => permissions.includes(permission))) throw new ForbiddenError();
                };
                request.rbac = { assertPermission: (permission: string) => assertPermissions([permission]),
                    assertOrPermissions: assertPermissions, hasSomePermission: () => false };
            });
            await app.register(ServiceRoutes);
            await app.register(ServiceTransactionRoutes);
            try {
                const service = await createService({ active: false });
                const transaction = await transactions.create({ service: service._id, period: '2026-01', status: 'PAID' });
                assert.equal((await app.inject({ method: 'POST', url: '/api/service-transactions/generate/2026-01' })).statusCode, 401);
                assert.equal((await app.inject({ method: 'POST', url: '/api/service-transactions/generate/2026-01', headers: { 'x-permissions': 'servicetransaction:view' } })).statusCode, 403);
                const manage = { 'x-permissions': 'servicetransaction:manage' };
                const monthly = await app.inject({ url: '/api/service-transactions/monthly/2026-01', headers: manage });
                assert.equal(monthly.statusCode, 200, monthly.body);
                assert.equal(monthly.json().transactions[0].service.businessPartner.name, 'Partner');
                assert.equal((await app.inject({ url: '/api/service-transactions/monthly/2026-13', headers: manage })).statusCode, 400);
                assert.equal((await app.inject({ method: 'POST', url: '/api/service-transactions/generate/2026-02', headers: manage })).statusCode, 200);
                assert.equal((await app.inject({ url: '/api/service-transactions/monthly/2026-01' })).statusCode, 401);
                assert.equal((await app.inject({ url: '/api/service-transactions/monthly/2026-01', headers: { 'x-permissions': 'servicetransaction:create' } })).statusCode, 403);
                const patched = await app.inject({ method: 'PATCH', url: `/api/service-transactions/${transaction._id}`,
                    headers: manage, payload: { amount: 55 } });
                assert.equal(patched.statusCode, 200, patched.body);
                assert.equal(patched.json().status, 'PAID');
                assert.equal(patched.json().paidAt, transaction.paidAt.toISOString());
                const clientDate = await app.inject({ method: 'PATCH', url: `/api/service-transactions/${transaction._id}`,
                    headers: manage, payload: { paidAt: '2000-01-01T00:00:00.000Z', amount: 56 } });
                assert.equal(clientDate.statusCode, 200, clientDate.body);
                assert.equal(clientDate.json().paidAt, transaction.paidAt.toISOString());
                const missingReference = await app.inject({ method: 'POST', url: '/api/service-transactions', headers: manage,
                    payload: { service: '507f1f77bcf86cd799439012', period: '2026-01' } });
                assert.equal(missingReference.statusCode, 404, missingReference.body);
                const patchedService = await app.inject({ method: 'PATCH', url: `/api/services/${service._id}`,
                    headers: { 'x-permissions': 'service:manage' }, payload: { name: 'Renamed' } });
                assert.equal(patchedService.statusCode, 200, patchedService.body);
                assert.equal(patchedService.json().active, false);
            } finally { await app.close(); }
        });
    });
}
