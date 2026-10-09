import { AbstractService } from '@drax/crud-back';
import { NotFoundError, ZodErrorToValidationError } from '@drax/common-back';

import type { ZodObject, ZodRawShape } from 'zod';
import type { IServiceTransactionRepository } from '../interfaces/IServiceTransactionRepository.js';
import type { IServiceTransaction, IServiceTransactionBase } from '../interfaces/IServiceTransaction.js';
import ServiceServiceFactory from '../factory/services/ServiceServiceFactory.js';
import { ServiceService } from './ServiceService.js';
import { ServiceTransactionBaseSchema, ServiceTransactionSchema, ServiceTransactionUpdateSchema,
    ServiceTransactionPatchSchema, ServicePeriodParamsSchema } from '../schemas/ServiceTransactionSchema.js';

class ServiceTransactionService extends AbstractService<IServiceTransaction, IServiceTransactionBase, IServiceTransactionBase> {
    constructor(private readonly repository: IServiceTransactionRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(repository, baseSchema ?? ServiceTransactionBaseSchema, fullSchema ?? ServiceTransactionSchema);
        this.transformCreate = data => this.validateService(data);
        this.transformUpdate = data => this.validateService(data);
        this.transformUpdatePartial = data => this.validateService(data);
    }

    private async validateService(data: IServiceTransactionBase): Promise<IServiceTransactionBase> {
        if (data.service !== undefined && !await ServiceServiceFactory.instance.findById(data.service)) {
            throw new NotFoundError('Service not found');
        }
        return data;
    }

    async validateInputUpdate(data: IServiceTransactionBase): Promise<IServiceTransactionBase> {
        const parsed = ServiceTransactionUpdateSchema.safeParse(data);
        if (!parsed.success) throw ZodErrorToValidationError(parsed.error, data);
        return parsed.data;
    }

    async validateInputUpdatePartial(data: IServiceTransactionBase): Promise<IServiceTransactionBase> {
        const parsed = ServiceTransactionPatchSchema.safeParse(data);
        if (!parsed.success) throw ZodErrorToValidationError(parsed.error, data);
        return parsed.data as IServiceTransactionBase;
    }

    private validatePeriod(period: string): string {
        const parsed = ServicePeriodParamsSchema.safeParse({ period });
        if (!parsed.success) throw ZodErrorToValidationError(parsed.error, { period });
        return parsed.data.period;
    }

    async generate(period: string): Promise<IServiceTransaction[]> {
        period = this.validatePeriod(period);
        const services = await ServiceServiceFactory.instance.fetchAll();
        const transactions: IServiceTransaction[] = [];
        for (const service of services) {
            if (!ServiceService.isDue(service, period)) continue;
            const item = await this.repository.generatePending(service._id, period);
            if (item) transactions.push(await this.validateOutput(item));
        }
        return transactions;
    }

    async monthly(period: string) {
        period = this.validatePeriod(period);
        const transactions = await this.findBy('period', period, 0);
        const summary = { expectedIncome: 0, collectedIncome: 0, pendingIncome: 0,
            expectedExpenses: 0, paidExpenses: 0, pendingExpenses: 0, transactions };
        for (const transaction of transactions) {
            const paid = transaction.status === 'PAID';
            if (transaction.service.type === 'INCOME') {
                summary.expectedIncome += transaction.amount;
                summary[paid ? 'collectedIncome' : 'pendingIncome'] += transaction.amount;
            } else {
                summary.expectedExpenses += transaction.amount;
                summary[paid ? 'paidExpenses' : 'pendingExpenses'] += transaction.amount;
            }
        }
        return summary;
    }

    async assertNoDuplicatePeriods(service: string): Promise<void> {
        await this.repository.assertNoDuplicatePeriods(service);
    }
}
export default ServiceTransactionService;
export { ServiceTransactionService };
