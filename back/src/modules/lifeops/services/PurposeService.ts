
import type{IPurposeRepository} from "../interfaces/IPurposeRepository";
import type {IPurposeBase, IPurpose} from "../interfaces/IPurpose";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class PurposeService extends AbstractService<IPurpose, IPurposeBase, IPurposeBase> {


    constructor(PurposeRepository: IPurposeRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(PurposeRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        this.transformCreate = this.normalizeCreateData.bind(this)
        
    }

    private async normalizeCreateData(data: IPurposeBase): Promise<IPurposeBase> {
        return {
            ...data,
            title: this.capitalizeFirstLetter(data.title)
        }
    }

    private capitalizeFirstLetter(value: string): string {
        if (!value) return value
        return value.charAt(0).toLocaleUpperCase('es') + value.slice(1)
    }

}

export default PurposeService
export {PurposeService}
