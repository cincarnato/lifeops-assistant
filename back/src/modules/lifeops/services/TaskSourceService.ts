
import type{ITaskSourceRepository} from "../interfaces/ITaskSourceRepository";
import type {ITaskSourceBase, ITaskSource} from "../interfaces/ITaskSource";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import AgentConfigService from "./AgentConfigService.js";

class TaskSourceService extends AbstractService<ITaskSource, ITaskSourceBase, ITaskSourceBase> {


    constructor(TaskSourceRepository: ITaskSourceRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TaskSourceRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        this.onCreated = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onUpdated = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onUpdatedPartial = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onDeleted = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        
    }

}

export default TaskSourceService
export {TaskSourceService}
