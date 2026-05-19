
import type{IPushDeviceRepository} from "../interfaces/IPushDeviceRepository";
import type {IPushDeviceBase, IPushDevice} from "../interfaces/IPushDevice";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class PushDeviceService extends AbstractService<IPushDevice, IPushDeviceBase, IPushDeviceBase> {


    constructor(PushDeviceRepository: IPushDeviceRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(PushDeviceRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default PushDeviceService
export {PushDeviceService}
