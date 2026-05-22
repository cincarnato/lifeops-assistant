import {DraxAgentFactory} from "@drax/ai-back"
import type {DraxAgentConfig, DraxAgentSystemPrompt, DraxAgentToolBuilderSource} from "@drax/ai-back"
import BaseAgent from "./BaseAgent.js"

class DefaultAgent extends BaseAgent {
    public override async prepare(): Promise<void> {
        this.prepareGoogleTools();
        this.preparePushTools();
        await super.prepare();
    }

    public configure(): void {
        DraxAgentFactory.instance().configure(this.buildConfig());
        this._initialized = true;
    }

    public override async refreshSystemPrompt(): Promise<string> {
        const systemPrompt = await super.refreshSystemPrompt();

        if (this._initialized) {
            DraxAgentFactory.instance().setSystemPrompt(this.buildDefaultSystemPrompt());
        }

        return systemPrompt;
    }

    public buildConfig(overrides: Partial<DraxAgentConfig> = {}): DraxAgentConfig {
        return {
            systemPrompt: this.buildDefaultSystemPrompt(),
            toolBuilders: this.toolBuilders,
            tools: this.tools,
            logToolExecution: this.logToolExecution,
            toolMaxIterations: 10,
            ...overrides
        };
    }

    private get toolBuilders(): DraxAgentToolBuilderSource {
        return context => [
            this.buildTaskTool(context),
            this.buildMemoryTool(context),
            this.buildClientTool(context),
            this.buildProjectTool(context),
            this.buildContactTool(context)
        ];
    }

    private buildDefaultSystemPrompt(): DraxAgentSystemPrompt {
        return async context => this.buildSystemPromptWithLifeOpsContext(context);
    }

    protected override onToolsChanged(): void {
        if (this._initialized) {
            DraxAgentFactory.instance().setTools(this.tools);
        }
    }
}

export default DefaultAgent
export {
    DefaultAgent
}
