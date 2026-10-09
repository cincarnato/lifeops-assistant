import { AbstractMongoRepository } from '@drax/crud-back';
import { NotFoundError } from '@drax/common-back';
import { ServiceModel } from '../../models/ServiceModel.js';
import type { IServiceRepository } from '../../interfaces/IServiceRepository.js';
import type { IService, IServiceBase } from '../../interfaces/IService.js';
import ServiceTransactionServiceFactory from '../../factory/services/ServiceTransactionServiceFactory.js';

class ServiceMongoRepository extends AbstractMongoRepository<IService, IServiceBase, IServiceBase> implements IServiceRepository {
    private static writeQueue: Promise<void> = Promise.resolve();

    constructor() {
        super();
        this._model = ServiceModel;
        this._searchFields = ['name'];
        this._populateFields = ['businessPartner'];
        this._lean = true;
    }

    // Shared by Service and ServiceTransaction repositories in this process only.
    // Callbacks must not enqueue another write: reads and duplicate checks stay unqueued.
    withWriteLock<T>(operation: () => Promise<T>): Promise<T> {
        const result = ServiceMongoRepository.writeQueue.then(operation);
        ServiceMongoRepository.writeQueue = result.then(() => undefined, () => undefined);
        return result;
    }

    async create(data: IServiceBase): Promise<IService> {
        return this.withWriteLock(() => super.create(data));
    }

    async update(id: string, data: IServiceBase): Promise<IService> {
        return this.withWriteLock(async () => {
            const current = await this.findById(id);
            if (!current) throw new NotFoundError('Service not found');
            if ((data.frequency ?? current.frequency) !== 'ON_DEMAND') {
                await ServiceTransactionServiceFactory.instance.assertNoDuplicatePeriods(id);
            }
            await ServiceModel.findByIdAndUpdate(id, { $set: data }, { runValidators: true });
            return this.findById(id);
        });
    }

    async updatePartial(id: string, data: IServiceBase): Promise<IService> {
        return this.update(id, data);
    }

    async delete(id: string) {
        return this.withWriteLock(() => super.delete(id));
    }
}
export default ServiceMongoRepository;
export { ServiceMongoRepository };
