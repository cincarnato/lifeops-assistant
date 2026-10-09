import {IEntitySchema} from '@drax/arch';

const entitySchema: IEntitySchema = {
    module: 'lifeops',
    name: 'Service',
    apiBasePath: 'services',
    apiTag: 'Service',
    collectionName: 'Service',
    schema: {
        name: {type: 'string', required: true, search: true, header: true},
        businessPartner: {type: 'ref', ref: 'BusinessPartner', refDisplay: 'name', required: true, index: true, header: true},
        type: {type: 'enum', enum: ['INCOME', 'EXPENSE'], required: true, header: true},
        amount: {type: 'number', required: true, header: true},
        frequency: {type: 'enum', enum: ['MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'YEARLY', 'ON_DEMAND'], required: true, header: true},
        active: {type: 'boolean', default: true, required: true, header: true}
    }
};

export default entitySchema;
export {entitySchema};
