
import type{IClientRepository} from "../interfaces/IClientRepository";
import type {IClientBase, IClient} from "../interfaces/IClient";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class ClientService extends AbstractService<IClient, IClientBase, IClientBase> {


    constructor(ClientRepository: IClientRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(ClientRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default ClientService
export {ClientService}
