import AgentConfigService from "../modules/lifeops/services/AgentConfigService.js"


async function initializeAgent(): Promise<void> {
    await AgentConfigService.instance.initializeAgent()
}

export { initializeAgent}
export default initializeAgent
