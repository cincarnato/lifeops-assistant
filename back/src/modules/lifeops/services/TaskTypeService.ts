
import type{ITaskTypeRepository} from "../interfaces/ITaskTypeRepository";
import type {ITaskTypeBase, ITaskType} from "../interfaces/ITaskType";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import AgentConfigService from "./AgentConfigService.js";

class TaskTypeService extends AbstractService<ITaskType, ITaskTypeBase, ITaskTypeBase> {


    constructor(TaskTypeRepository: ITaskTypeRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TaskTypeRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        this.onCreated = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onUpdated = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onUpdatedPartial = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onDeleted = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        
    }

}

export default TaskTypeService
export {TaskTypeService}
