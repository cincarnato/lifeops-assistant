import { AbstractSqliteRepository } from '@drax/crud-back';
import { NotFoundError } from '@drax/common-back';
import type { SqliteTableField } from '@drax/common-back';
import type { IServiceRepository } from '../../interfaces/IServiceRepository.js';
import type { IService, IServiceBase } from '../../interfaces/IService.js';
import ServiceTransactionServiceFactory from '../../factory/services/ServiceTransactionServiceFactory.js';

class ServiceSqliteRepository extends AbstractSqliteRepository<IService, IServiceBase, IServiceBase> implements IServiceRepository {
    protected tableName = 'Service';
    protected searchFields = ['name'];
    protected booleanFields = ['active'];
    protected jsonFields: string[] = [];
    protected identifier = '_id';
    protected populateFields = [{ field: 'businessPartner', table: 'BusinessPartner', identifier: '_id' }];
    protected tableFields: SqliteTableField[] = [
        { name: 'name', type: 'TEXT', primary: false, unique: false },
        { name: 'businessPartner', type: 'TEXT', primary: false, unique: false },
        { name: 'type', type: 'TEXT', primary: false, unique: false },
        { name: 'amount', type: 'NUMERIC', primary: false, unique: false },
        { name: 'frequency', type: 'TEXT', primary: false, unique: false },
        { name: 'active', type: 'INTEGER', primary: false, unique: false }
    ];

    readForSqliteTransaction(id: string, db: any): Pick<IService, 'active' | 'frequency' | 'amount'> {
        const service = db.prepare('SELECT active, frequency, amount FROM Service WHERE _id = ?').get(id);
        if (!service) throw new NotFoundError('Service not found');
        service.active = service.active === 1 || service.active === 'true';
        return service;
    }

    async decorate(item: any) {
        if (item) await super.decorate(item);
    }

    async update(id: string, data: IServiceBase): Promise<IService> {
        if (!await this.findById(id)) throw new NotFoundError('Service not found');
        if (!Object.keys(data).length) return this.findById(id);
        if (data.frequency && data.frequency !== 'ON_DEMAND') {
            await ServiceTransactionServiceFactory.instance.assertNoDuplicatePeriods(id);
        }
        return super.update(id, { ...data });
    }
}
export default ServiceSqliteRepository;
export { ServiceSqliteRepository };
