
import type{ILifeAreaRepository} from "../interfaces/ILifeAreaRepository";
import type {ILifeAreaBase, ILifeArea} from "../interfaces/ILifeArea";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import AgentConfigService from "./AgentConfigService.js";

class LifeAreaService extends AbstractService<ILifeArea, ILifeAreaBase, ILifeAreaBase> {


    constructor(LifeAreaRepository: ILifeAreaRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(LifeAreaRepository, baseSchema, fullSchema);

        this._validateOutput = true
        this.onCreated = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onUpdated = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onUpdatedPartial = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()
        this.onDeleted = async () => AgentConfigService.instance.refreshSystemPromptOnTaskOptionsChange()

    }

}

export default LifeAreaService
export {LifeAreaService}
