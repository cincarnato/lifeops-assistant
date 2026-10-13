import {IEntitySchema} from '@drax/arch';

const entitySchema: IEntitySchema = {
    module: 'lifeops',
    name: 'Delegate',
    apiBasePath: 'delegates',
    apiTag: 'Delegate',
    collectionName: 'Delegate',
    schema: {
        contact: {type: 'ref', ref: 'Contact', refDisplay: 'displayName', required: true, header: true},
        skills: {type: 'array.string', default: [], header: true},
        description: {type: 'longString', search: true},
        active: {type: 'boolean', default: true, header: true},
        user: {type: 'ref', ref: 'User', refDisplay: 'username', required: true, index: true}
    }
};

export default entitySchema;
export {entitySchema};
