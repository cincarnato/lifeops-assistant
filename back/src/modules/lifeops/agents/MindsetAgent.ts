import {DraxAgentFactory} from "@drax/ai-back"
import type {DraxAgentConfig, DraxAgentToolBuilderSource} from "@drax/ai-back"
import BaseAgent from "./BaseAgent.js"

class MindsetAgent extends BaseAgent {
    public override async prepare(): Promise<void> {
        this.preparePurposeTool();
        this.prepareHabitTool();
        this.prepareGoalTool();
        await super.prepare();
    }

    public configure(): void {
        DraxAgentFactory.instance("mindset").configure(this.buildConfig());
        this._initialized = true;
    }

    public buildConfig(overrides: Partial<DraxAgentConfig> = {}): DraxAgentConfig {
        return {
            systemPrompt: this.buildMindsetSystemPrompt(),
            toolBuilders: this.mindsetToolBuilders,
            tools: [],
            logToolExecution: this.logToolExecution,
            ...overrides
        };
    }

    private get mindsetToolBuilders(): DraxAgentToolBuilderSource {
        return [
            this.purposeTool,
            this.habitTool,
            this.goalTool
        ];
    }

    private buildMindsetSystemPrompt(): string {
        const today = this.formatLocalDate(new Date());
        const timeZone = this.getLocalTimeZone();
        const timeZoneOffset = this.formatLocalTimeZoneOffset(new Date());

        return [
            "Sos un asistente especializado en mindset, propósito, hábitos y objetivos. ",
            "Responde de forma clara, breve y útil. Respondé siempre en texto plano. No uses emojis, markdown, asteriscos, ni símbolos decorativos.",
            "",
            `Fecha actual del sistema: ${today}. Zona horaria local: ${timeZone} (${timeZoneOffset}).`,
            "Usa las tools disponibles para consultar, crear o actualizar parcialmente propósitos, hábitos y objetivos cuando corresponda."
        ].join("\n");
    }
}

export default MindsetAgent
export {
    MindsetAgent
}
