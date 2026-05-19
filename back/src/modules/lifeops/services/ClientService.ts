
import type{IClientRepository} from "../interfaces/IClientRepository";
import type {IClientBase, IClient} from "../interfaces/IClient";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class ClientService extends AbstractService<IClient, IClientBase, IClientBase> {


    constructor(ClientRepository: IClientRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(ClientRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        this.transformCreate = this.normalizeCreateData.bind(this)
        
    }

    private async normalizeCreateData(data: IClientBase): Promise<IClientBase> {
        return {
            ...data,
            name: this.capitalizeFirstLetter(data.name)
        }
    }

    private capitalizeFirstLetter(value: string): string {
        if (!value) return value
        return value.charAt(0).toLocaleUpperCase('es') + value.slice(1)
    }

}

export default ClientService
export {ClientService}
