import { AbstractMongoRepository } from '@drax/crud-back';
import { BadRequestError, NotFoundError, mongoose } from '@drax/common-back';
import { ServiceTransactionModel } from '../../models/ServiceTransactionModel.js';
import type { IServiceTransactionRepository } from '../../interfaces/IServiceTransactionRepository.js';
import type { IServiceTransaction, IServiceTransactionBase } from '../../interfaces/IServiceTransaction.js';
import ServiceServiceFactory from '../../factory/services/ServiceServiceFactory.js';
import { ServiceService } from '../../services/ServiceService.js';

class ServiceTransactionMongoRepository extends AbstractMongoRepository<IServiceTransaction, IServiceTransactionBase, IServiceTransactionBase> implements IServiceTransactionRepository {
    constructor() {
        super();
        this._model = ServiceTransactionModel;
        this._searchFields = [];
        this._populateFields = [{ path: 'service', populate: { path: 'businessPartner' } }] as any;
        this._lean = true;
    }

    private async write(data: Partial<IServiceTransactionBase>, id?: string, generation = false): Promise<IServiceTransaction | null> {
        if (id) this.assertId(id);
        return ServiceServiceFactory.instance.withWriteLock(async () => {
            const current = id ? await ServiceTransactionModel.findById(id).lean() : null;
            if (id && !current) throw new NotFoundError('ServiceTransaction not found');
            const serviceId = data.service ?? current?.service?.toString();
            const service = await ServiceServiceFactory.instance.findById(serviceId);
            if (!service) throw new NotFoundError('Service not found');
            const period = data.period ?? current?.period;
            if (generation && !ServiceService.isDue(service, period)) return null;
            if (service.frequency !== 'ON_DEMAND') {
                const duplicate = await ServiceTransactionModel.findOne({
                    service: serviceId, period, ...(id ? { _id: { $ne: id } } : {})
                }).lean();
                if (duplicate) {
                    if (!generation) throw new BadRequestError('A recurring transaction already exists for this service and period');
                    return this.findById(duplicate._id.toString());
                }
            }
            const status = data.status ?? current?.status ?? 'PENDING';
            const paidAt = status === 'PENDING' ? null
                : current?.status === 'PAID' ? current.paidAt : new Date();
            const payload = { ...data, service: serviceId, period,
                amount: data.amount ?? current?.amount ?? service.amount, status, paidAt };
            if (id) {
                await ServiceTransactionModel.findByIdAndUpdate(id, { $set: payload }, { runValidators: true });
                return this.findById(id);
            }
            const created = await ServiceTransactionModel.create(payload);
            return this.findById(created._id.toString());
        });
    }

    async create(data: IServiceTransactionBase): Promise<IServiceTransaction> {
        return this.write(data);
    }
    async update(id: string, data: IServiceTransactionBase): Promise<IServiceTransaction> {
        return this.write(data, id);
    }
    async updatePartial(id: string, data: IServiceTransactionBase): Promise<IServiceTransaction> {
        return this.write(data, id);
    }
    async delete(id: string) {
        return ServiceServiceFactory.instance.withWriteLock(() => super.delete(id));
    }
    async generatePending(service: string, period: string): Promise<IServiceTransaction | null> {
        return this.write({ service, period, status: 'PENDING' }, undefined, true);
    }
    async assertNoDuplicatePeriods(service: string): Promise<void> {
        const duplicates = await ServiceTransactionModel.aggregate([
            { $match: { service: new mongoose.Types.ObjectId(service) } },
            { $group: { _id: '$period', count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }, { $limit: 1 }
        ]);
        if (duplicates.length) throw new BadRequestError('Duplicate periods prevent changing this service to recurring');
    }
}
export default ServiceTransactionMongoRepository;
export { ServiceTransactionMongoRepository };
