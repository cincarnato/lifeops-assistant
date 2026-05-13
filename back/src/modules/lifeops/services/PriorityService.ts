
import type{IPriorityRepository} from "../interfaces/IPriorityRepository";
import type {IPriorityBase, IPriority} from "../interfaces/IPriority";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import AgentConfigService from "./AgentConfigService.js";

class PriorityService extends AbstractService<IPriority, IPriorityBase, IPriorityBase> {


    constructor(PriorityRepository: IPriorityRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(PriorityRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        this.onCreated = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onUpdated = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onUpdatedPartial = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onDeleted = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        
    }

}

export default PriorityService
export {PriorityService}
