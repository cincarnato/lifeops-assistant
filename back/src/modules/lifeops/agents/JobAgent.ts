import {AiProviderFactory} from "@drax/ai-back"
import type {DraxAgentConfig} from "@drax/ai-back"
import type {DraxAgentSystemPrompt, DraxAgentToolBuilderSource, IPromptTool} from "@drax/ai-back"
import BaseAgent from "./BaseAgent.js"

interface AgentConfigJobAgent {
    systemPrompt: string;
    allowedTools?: string[];
    onToolCall?: (toolCall: {
        name: string;
        status: "success" | "failed";
        input?: any;
        output?: any;
        errorMessage?: string;
        durationMs?: number;
    }) => void | Promise<void>;
}

class JobAgent extends BaseAgent {
    public override async prepare(): Promise<void> {
        this.prepareTaskTool();
        this.prepareMemoryTool();
        this.prepareClientTool();
        this.prepareProjectTool();
        this.prepareContactTool();
        this.prepareGoogleTools();
        this.preparePushTools();
        await super.prepare();
    }

    public buildConfig(agentOrOverrides: AgentConfigJobAgent | Partial<DraxAgentConfig> = {}): DraxAgentConfig {
        if (!this.isJobAgentConfig(agentOrOverrides)) {
            return this.buildBaseConfig(agentOrOverrides);
        }

        const agent = agentOrOverrides;
        const allowedTools = new Set(agent.allowedTools ?? []);
        const shouldFilterTools = allowedTools.size > 0;
        const shouldAdaptToolBuilders = shouldFilterTools || Boolean(agent.onToolCall);

        return this.buildBaseConfig({
            provider: this.getJobProvider(),
            systemPrompt: this.buildJobSystemPrompt(agent),
            toolBuilders: shouldAdaptToolBuilders
                ? async context => {
                    const toolBuilderSource = this.toolBuilders;
                    const toolBuilders = typeof toolBuilderSource === "function"
                        ? await toolBuilderSource(context)
                        : toolBuilderSource;

                    return toolBuilders.map(builder => ({
                        getSystemPromptSection: () => builder.getSystemPromptSection(),
                        getTools: () => builder.getTools()
                            .filter(tool => !shouldFilterTools || allowedTools.has(tool.name))
                            .map(tool => this.withJobToolCallLog(tool, agent))
                    }));
                }
                : this.toolBuilders,
            tools: async context => {
                const toolSource = this.tools;
                const tools = typeof toolSource === "function"
                    ? await toolSource(context)
                    : toolSource;

                return tools
                    .filter(tool => !shouldFilterTools || allowedTools.has(tool.name))
                    .map(tool => this.withJobToolCallLog(tool, agent));
            }
        });
    }

    private buildBaseConfig(overrides: Partial<DraxAgentConfig> = {}): DraxAgentConfig {
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
        return [
            this.taskTool,
            this.memoryTool,
            this.clientTool,
            this.projectTool,
            this.contactTool
        ];
    }

    private buildDefaultSystemPrompt(): DraxAgentSystemPrompt {
        return async context => this.buildSystemPromptWithLifeOpsContext(context);
    }

    private buildJobSystemPrompt(agent: AgentConfigJobAgent): DraxAgentConfig["systemPrompt"] {
        return async () => {
            await this.prepareSystemPrompt();

            return [
                this.systemPrompt,
                "",
                "[JOB PROGRAMADO]",
                agent.systemPrompt,
                "",
                "Ejecuta este job de forma autonoma. Si realizas acciones con tools, resume que hiciste y el resultado final."
            ].join("\n");
        };
    }

    private withJobToolCallLog(tool: IPromptTool, agent: AgentConfigJobAgent): IPromptTool {
        if (!agent.onToolCall) {
            return tool;
        }

        return {
            ...tool,
            execute: async args => {
                const startedAt = Date.now();

                try {
                    const output = await tool.execute(args);
                    await agent.onToolCall?.({
                        name: tool.name,
                        status: "success",
                        input: args,
                        output,
                        durationMs: Date.now() - startedAt
                    });

                    return output;
                } catch (error) {
                    await agent.onToolCall?.({
                        name: tool.name,
                        status: "failed",
                        input: args,
                        errorMessage: error?.message ?? String(error),
                        durationMs: Date.now() - startedAt
                    });

                    throw error;
                }
            }
        };
    }

    private getJobProvider(): DraxAgentConfig["provider"] {
        return AiProviderFactory.instance(process.env.AI_PROVIDER || "OpenAi");
    }

    private isJobAgentConfig(value: AgentConfigJobAgent | Partial<DraxAgentConfig>): value is AgentConfigJobAgent {
        return typeof (value as AgentConfigJobAgent).systemPrompt === "string";
    }
}

export default JobAgent
export {
    JobAgent
}
export type {
    AgentConfigJobAgent
}
