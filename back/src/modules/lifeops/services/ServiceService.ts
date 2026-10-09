import { AbstractService } from '@drax/crud-back';
import { NotFoundError, ZodErrorToValidationError } from '@drax/common-back';

import type { ZodObject, ZodRawShape } from 'zod';
import type { IServiceRepository } from '../interfaces/IServiceRepository.js';
import type { IService, IServiceBase } from '../interfaces/IService.js';
import BusinessPartnerServiceFactory from '../factory/services/BusinessPartnerServiceFactory.js';
import { ServiceBaseSchema, ServiceSchema, ServiceUpdateSchema, ServicePatchSchema } from '../schemas/ServiceSchema.js';

class ServiceService extends AbstractService<IService, IServiceBase, IServiceBase> {
    constructor(private readonly repository: IServiceRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(repository, baseSchema ?? ServiceBaseSchema, fullSchema ?? ServiceSchema);
        this.transformCreate = data => this.validatePartner(data);
        this.transformUpdate = data => this.validatePartner(data);
        this.transformUpdatePartial = data => this.validatePartner(data);
    }

    private async validatePartner(data: IServiceBase): Promise<IServiceBase> {
        if (data.businessPartner !== undefined && !await BusinessPartnerServiceFactory.instance.findById(data.businessPartner)) {
            throw new NotFoundError('BusinessPartner not found');
        }
        return data;
    }

    async validateInputUpdate(data: IServiceBase): Promise<IServiceBase> {
        const parsed = ServiceUpdateSchema.safeParse(data);
        if (!parsed.success) throw ZodErrorToValidationError(parsed.error, data);
        return parsed.data;
    }

    async validateInputUpdatePartial(data: IServiceBase): Promise<IServiceBase> {
        const parsed = ServicePatchSchema.safeParse(data);
        if (!parsed.success) throw ZodErrorToValidationError(parsed.error, data);
        return parsed.data as IServiceBase;
    }

    readForSqliteTransaction(id: string, db: any): Pick<IService, 'active' | 'frequency' | 'amount'> {
        if (!this.repository.readForSqliteTransaction) throw new Error('SQLite transaction reads require SQLite');
        return this.repository.readForSqliteTransaction(id, db);
    }

    withWriteLock<T>(operation: () => Promise<T>): Promise<T> {
        if (!this.repository.withWriteLock) throw new Error('The service write queue requires MongoDB');
        return this.repository.withWriteLock(operation);
    }

    static isDue(service: Pick<IService, 'active' | 'frequency'>, period: string): boolean {
        if (!service.active) return false;
        const month = Number(period.slice(5));
        switch (service.frequency) {
            case 'MONTHLY': return true;
            case 'BIMONTHLY': return month % 2 === 1;
            case 'QUARTERLY': return (month - 1) % 3 === 0;
            case 'YEARLY': return month === 1;
            default: return false;
        }
    }
}
export default ServiceService;
export { ServiceService };
