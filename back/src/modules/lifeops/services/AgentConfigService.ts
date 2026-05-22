import type {DraxAgentConfig} from "@drax/ai-back"
import DefaultAgent from "../agents/DefaultAgent.js"
import CrmAgent from "../agents/CrmAgent.js"
import MindsetAgent from "../agents/MindsetAgent.js"
import JobAgent from "../agents/JobAgent.js"
import type {AgentConfigToolSource} from "../agents/BaseAgent.js"
import type {AgentConfigJobAgent} from "../agents/JobAgent.js"

class AgentConfigService {
    private static service: AgentConfigService;

    public readonly defaultAgent = new DefaultAgent();
    public readonly crmAgent = new CrmAgent();
    public readonly mindsetAgent = new MindsetAgent();
    public readonly jobAgent = new JobAgent();

    public static get instance(): AgentConfigService {
        if (!AgentConfigService.service) {
            AgentConfigService.service = new AgentConfigService();
        }

        return AgentConfigService.service;
    }

    public async initializeAgent(): Promise<void> {
        await this.prepare();
        this.defaultAgent.configure();
        this.mindsetAgent.configure();
        this.crmAgent.configure();
    }

    public addTool(tool: AgentConfigToolSource): this {
        this.defaultAgent.addTool(tool);
        this.jobAgent.addTool(tool);

        return this;
    }

    public addTools(tools: AgentConfigToolSource[]): this {
        for (const tool of tools) {
            this.addTool(tool);
        }

        return this;
    }

    public async prepare(): Promise<void> {
        await Promise.all([
            this.defaultAgent.prepare(),
            this.mindsetAgent.prepare(),
            this.crmAgent.prepare(),
            this.jobAgent.prepare()
        ]);
    }

    public async refreshSystemPrompt(): Promise<string> {
        const [defaultSystemPrompt] = await Promise.all([
            this.defaultAgent.refreshSystemPrompt(),
            this.jobAgent.refreshSystemPrompt()
        ]);

        return defaultSystemPrompt;
    }

    public async refreshSystemPromptOnTaskOptionsChange(): Promise<void> {
        try {
            await this.refreshSystemPrompt();
        } catch (e) {
            console.error("Error refreshing agent system prompt", {
                name: e?.name,
                message: e?.message,
                stack: e?.stack
            });
        }
    }

    public buildAgentConfig(overrides: Partial<DraxAgentConfig> = {}): DraxAgentConfig {
        return this.defaultAgent.buildConfig(overrides);
    }

    public buildMindsetAgentConfig(overrides: Partial<DraxAgentConfig> = {}): DraxAgentConfig {
        return this.mindsetAgent.buildConfig(overrides);
    }

    public buildCrmAgentConfig(overrides: Partial<DraxAgentConfig> = {}): DraxAgentConfig {
        return this.crmAgent.buildConfig(overrides);
    }

    public buildJobAgentConfig(agent: AgentConfigJobAgent): DraxAgentConfig {
        return this.jobAgent.buildConfig(agent);
    }
}

export default AgentConfigService
export {
    AgentConfigService
}
export type {
    AgentConfigToolSource
}
