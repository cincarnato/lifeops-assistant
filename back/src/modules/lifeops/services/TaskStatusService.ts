
import type{ITaskStatusRepository} from "../interfaces/ITaskStatusRepository";
import type {ITaskStatusBase, ITaskStatus} from "../interfaces/ITaskStatus";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import AgentConfigService from "./AgentConfigService.js";

class TaskStatusService extends AbstractService<ITaskStatus, ITaskStatusBase, ITaskStatusBase> {


    constructor(TaskStatusRepository: ITaskStatusRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TaskStatusRepository, baseSchema, fullSchema);

        this._validateOutput = true
        this.onCreated = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onUpdated = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onUpdatedPartial = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onDeleted = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()

    }

}

export default TaskStatusService
export {TaskStatusService}
