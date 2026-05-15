
import type{ISourceRepository} from "../interfaces/ISourceRepository";
import type {ISourceBase, ISource} from "../interfaces/ISource";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import AgentConfigService from "./AgentConfigService.js";

class SourceService extends AbstractService<ISource, ISourceBase, ISourceBase> {


    constructor(SourceRepository: ISourceRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(SourceRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        this.onCreated = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onUpdated = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onUpdatedPartial = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onDeleted = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        
    }

}

export default SourceService
export {SourceService}
