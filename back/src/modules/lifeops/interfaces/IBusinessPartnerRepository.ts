
import type {IBusinessPartner, IBusinessPartnerBase} from './IBusinessPartner'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IBusinessPartnerRepository extends IDraxCrudRepository<IBusinessPartner, IBusinessPartnerBase, IBusinessPartnerBase>{
    migrateLegacyClients?(): Promise<void>
}

export {IBusinessPartnerRepository}
