import {DraxAgent, BuilderTool} from "@drax/ai-back"
import type {DraxAgentConfig, DraxAgentToolBuilderSource} from "@drax/ai-back"
import {TaskServiceFactory} from "../modules/lifeops/factory/services/TaskServiceFactory.js"
import {TaskBaseSchema} from "../modules/lifeops/schemas/TaskSchema.js"


async function initializeAgent(): Promise<void> {

    const taskTool = new BuilderTool({
        entityDescription: "Tareas",
        entityName: "Task",
        methods: ["search","find","create","updatePartial", "groupBy"],
        schema: TaskBaseSchema,
        service: TaskServiceFactory.instance

    })

    const toolBuilders: DraxAgentToolBuilderSource = [
        taskTool
    ]
    const config: DraxAgentConfig = {
        toolBuilders: toolBuilders
    }

    DraxAgent.instance().configure(config)
}

export { initializeAgent}
export default initializeAgent
