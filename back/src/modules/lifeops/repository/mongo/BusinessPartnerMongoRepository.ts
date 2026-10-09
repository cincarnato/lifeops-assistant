
import {AbstractMongoRepository} from "@drax/crud-back";
import {BusinessPartnerModel} from "../../models/BusinessPartnerModel.js";
import type {IBusinessPartnerRepository} from '../../interfaces/IBusinessPartnerRepository'
import type {IBusinessPartner, IBusinessPartnerBase} from "../../interfaces/IBusinessPartner";


class BusinessPartnerMongoRepository extends AbstractMongoRepository<IBusinessPartner, IBusinessPartnerBase, IBusinessPartnerBase> implements IBusinessPartnerRepository {

    constructor() {
        super();
        this._model = BusinessPartnerModel;
        this._searchFields = ['name', 'aliases', 'legalName', 'taxCondition', 'taxIdType', 'taxIdNumber', 'taxAddress', 'taxEmail', 'description', 'website'];
        this._populateFields = ['mainContact', 'user'];
        this._lean = true
    }

    async migrateLegacyClients(): Promise<void> {
        const database = BusinessPartnerModel.db.db
        if (!database) throw new Error('BusinessPartner migration requires a MongoDB connection')

        const legacyCollection = database.collection('Client')
        const collectionExists = await database.listCollections({name: 'Client'}).hasNext()
        if (collectionExists) {
            for await (const document of legacyCollection.find({})) {
                const roles = Array.isArray(document.roles)
                    ? document.roles.filter(role => role === 'client' || role === 'provider')
                    : []
                await BusinessPartnerModel.collection.updateOne(
                    {_id: document._id},
                    {$setOnInsert: {...document, roles}},
                    {upsert: true}
                )
                await legacyCollection.deleteOne({_id: document._id})
            }
            await legacyCollection.drop()
        }

        await BusinessPartnerModel.collection.updateMany(
            {roles: {$in: ['none', 'prospect']}},
            [{$set: {roles: {$filter: {
                input: '$roles',
                as: 'role',
                cond: {$in: ['$$role', ['client', 'provider']]}
            }}}}]
        )
    }

}

export default BusinessPartnerMongoRepository
export {BusinessPartnerMongoRepository}
