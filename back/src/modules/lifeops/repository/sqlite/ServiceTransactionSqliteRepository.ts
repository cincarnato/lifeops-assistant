import { randomUUID } from 'node:crypto';
import { AbstractSqliteRepository } from '@drax/crud-back';
import { BadRequestError, NotFoundError } from '@drax/common-back';
import type { SqliteTableField } from '@drax/common-back';
import type { IServiceTransactionRepository } from '../../interfaces/IServiceTransactionRepository.js';
import type { IServiceTransaction, IServiceTransactionBase } from '../../interfaces/IServiceTransaction.js';
import ServiceServiceFactory from '../../factory/services/ServiceServiceFactory.js';
import { ServiceService } from '../../services/ServiceService.js';

class ServiceTransactionSqliteRepository extends AbstractSqliteRepository<IServiceTransaction, IServiceTransactionBase, IServiceTransactionBase> implements IServiceTransactionRepository {
    protected tableName = 'ServiceTransaction';
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier = '_id';
    protected populateFields = [{ field: 'service', table: 'Service', identifier: '_id' }];
    protected tableFields: SqliteTableField[] = [
        { name: 'service', type: 'TEXT', primary: false, unique: false },
        { name: 'period', type: 'TEXT', primary: false, unique: false },
        { name: 'amount', type: 'NUMERIC', primary: false, unique: false },
        { name: 'status', type: 'TEXT', primary: false, unique: false },
        { name: 'paidAt', type: 'TEXT', primary: false, unique: false }
    ];

    build() {
        super.build();
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS ServiceTransaction_service_period ON ServiceTransaction(service, period);
            CREATE TRIGGER IF NOT EXISTS ServiceTransaction_recurring_insert BEFORE INSERT ON ServiceTransaction
            WHEN (SELECT frequency FROM Service WHERE _id = NEW.service) <> 'ON_DEMAND'
              AND EXISTS (SELECT 1 FROM ServiceTransaction WHERE service = NEW.service AND period = NEW.period)
            BEGIN SELECT RAISE(ABORT, 'Duplicate recurring service period'); END;
            CREATE TRIGGER IF NOT EXISTS ServiceTransaction_recurring_update BEFORE UPDATE OF service, period ON ServiceTransaction
            WHEN (SELECT frequency FROM Service WHERE _id = NEW.service) <> 'ON_DEMAND'
              AND EXISTS (SELECT 1 FROM ServiceTransaction WHERE service = NEW.service AND period = NEW.period AND _id <> NEW._id)
            BEGIN SELECT RAISE(ABORT, 'Duplicate recurring service period'); END;
            CREATE TRIGGER IF NOT EXISTS Service_recurring_frequency BEFORE UPDATE OF frequency ON Service
            WHEN NEW.frequency <> 'ON_DEMAND'
              AND EXISTS (SELECT period FROM ServiceTransaction WHERE service = NEW._id GROUP BY period HAVING COUNT(*) > 1)
            BEGIN SELECT RAISE(ABORT, 'Duplicate periods prevent changing this service to recurring'); END;
        `);
    }

    async decorate(item: any) {
        if (item) await super.decorate(item);
    }

    async prepareItem(item: any) {
        if (item?.service) {
            item.service = await ServiceServiceFactory.instance.findById(item.service._id);
        }
        return item;
    }

    private async write(data: Partial<IServiceTransactionBase>, id?: string, generation = false): Promise<IServiceTransaction | null> {
        const resultId = this.db.transaction(() => {
            const current = id ? this.db.prepare('SELECT * FROM ServiceTransaction WHERE _id = ?').get(id) : null;
            if (id && !current) throw new NotFoundError('ServiceTransaction not found');
            const serviceId = data.service ?? current?.service;
            // Read within the write transaction so default amounts/cadence cannot race a service edit.
            const service = ServiceServiceFactory.instance.readForSqliteTransaction(serviceId, this.db);
            const period = data.period ?? current?.period;
            if (generation && !ServiceService.isDue(service, period)) return null;
            if (service.frequency !== 'ON_DEMAND') {
                const duplicate = this.db.prepare('SELECT _id FROM ServiceTransaction WHERE service = ? AND period = ? AND _id <> ?')
                    .get(serviceId, period, id ?? '');
                if (duplicate) {
                    if (generation) return duplicate._id;
                    throw new BadRequestError('A recurring transaction already exists for this service and period');
                }
            }
            const status = data.status ?? current?.status ?? 'PENDING';
            const paidAt = status === 'PENDING' ? null : current?.status === 'PAID' ? current.paidAt : new Date().toISOString();
            const payload = { _id: id ?? randomUUID(), service: serviceId, period,
                amount: data.amount ?? current?.amount ?? service.amount, status, paidAt };
            if (id) {
                this.db.prepare('UPDATE ServiceTransaction SET service = @service, period = @period, amount = @amount, status = @status, paidAt = @paidAt WHERE _id = @_id').run(payload);
            } else {
                this.db.prepare('INSERT INTO ServiceTransaction (_id, service, period, amount, status, paidAt) VALUES (@_id, @service, @period, @amount, @status, @paidAt)').run(payload);
            }
            return payload._id;
        }).immediate();
        return resultId ? this.findById(resultId) : null;
    }

    async create(data: IServiceTransactionBase): Promise<IServiceTransaction> { return this.write(data); }
    async update(id: string, data: IServiceTransactionBase): Promise<IServiceTransaction> { return this.write(data, id); }
    async updatePartial(id: string, data: IServiceTransactionBase): Promise<IServiceTransaction> { return this.write(data, id); }
    async generatePending(service: string, period: string): Promise<IServiceTransaction | null> {
        return this.write({ service, period, status: 'PENDING' }, undefined, true);
    }
    async findBy(field: string, value: any, limit = 0, filters = []): Promise<IServiceTransaction[]> {
        return super.findBy(field, value, limit > 0 ? limit : -1, filters);
    }
    async assertNoDuplicatePeriods(service: string): Promise<void> {
        const duplicate = this.db.prepare('SELECT period FROM ServiceTransaction WHERE service = ? GROUP BY period HAVING COUNT(*) > 1 LIMIT 1').get(service);
        if (duplicate) throw new BadRequestError('Duplicate periods prevent changing this service to recurring');
    }
}
export default ServiceTransactionSqliteRepository;
export { ServiceTransactionSqliteRepository };
