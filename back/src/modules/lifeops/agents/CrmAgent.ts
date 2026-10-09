import {DraxAgentFactory} from "@drax/ai-back"
import type {DraxAgentConfig, DraxAgentToolBuilderSource} from "@drax/ai-back"
import BaseAgent from "./BaseAgent.js"

class CrmAgent extends BaseAgent {
    public override async prepare(): Promise<void> {
        await super.prepare();
    }

    public configure(): void {
        DraxAgentFactory.instance("CRM", "Especialista en partes, organizaciones y contactos").configure(this.buildConfig());
        this._initialized = true;
    }

    public buildConfig(overrides: Partial<DraxAgentConfig> = {}): DraxAgentConfig {
        return {
            systemPrompt: this.buildCrmSystemPrompt(),
            toolBuilders: this.crmToolBuilders,
            tools: [],
            logToolExecution: this.logToolExecution,
            ...overrides
        };
    }

    private get crmToolBuilders(): DraxAgentToolBuilderSource {
        return context => [
            this.buildBusinessPartnerTool(context),
            this.buildContactTool(context)
        ];
    }

    private buildCrmSystemPrompt(): string {
        const today = this.formatLocalDate(new Date());
        const timeZone = this.getLocalTimeZone();
        const timeZoneOffset = this.formatLocalTimeZoneOffset(new Date());

        return [
            "Sos un asistente especializado en CRM, partes, organizaciones y contactos.",
            "Responde de forma clara, breve y útil. Respondé siempre en texto plano. No uses emojis, markdown, asteriscos, ni símbolos decorativos.",
            "",
            `Fecha actual del sistema: ${today}. Zona horaria local: ${timeZone} (${timeZoneOffset}).`,
            "Usa las tools disponibles para consultar, crear o actualizar parcialmente partes, organizaciones y contactos cuando corresponda.",
            "Antes de crear una parte, organización o contacto, buscá si ya existe para evitar duplicados."
        ].join("\n");
    }
}

export default CrmAgent
export {
    CrmAgent
}
