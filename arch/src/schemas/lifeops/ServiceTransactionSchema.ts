import {IEntitySchema} from '@drax/arch';

const entitySchema: IEntitySchema = {
    module: 'lifeops',
    name: 'ServiceTransaction',
    apiBasePath: 'service-transactions',
    apiTag: 'ServiceTransaction',
    collectionName: 'ServiceTransaction',
    schema: {
        service: {type: 'ref', ref: 'Service', refDisplay: 'name', required: true, index: true, header: true},
        period: {type: 'string', required: true, index: true, header: true},
        amount: {type: 'number', required: true, header: true},
        status: {type: 'enum', enum: ['PENDING', 'PAID'], required: true, default: 'PENDING', header: true},
        paidAt: {type: 'date', default: null, header: true}
    }
};

export default entitySchema;
export {entitySchema};
