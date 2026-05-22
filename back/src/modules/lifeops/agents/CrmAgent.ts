import {DraxAgentFactory} from "@drax/ai-back"
import type {DraxAgentConfig, DraxAgentToolBuilderSource} from "@drax/ai-back"
import BaseAgent from "./BaseAgent.js"

class CrmAgent extends BaseAgent {
    public override async prepare(): Promise<void> {
        this.prepareClientTool();
        this.prepareCompanyTool();
        this.prepareContactTool();
        await super.prepare();
    }

    public configure(): void {
        DraxAgentFactory.instance("CRM", "Especialista en clientes, empresas y contactos").configure(this.buildConfig());
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
        return [
            this.clientTool,
            this.companyTool,
            this.contactTool
        ];
    }

    private buildCrmSystemPrompt(): string {
        const today = this.formatLocalDate(new Date());
        const timeZone = this.getLocalTimeZone();
        const timeZoneOffset = this.formatLocalTimeZoneOffset(new Date());

        return [
            "Sos un asistente especializado en CRM, clientes, empresas y contactos.",
            "Responde de forma clara, breve y útil. Respondé siempre en texto plano. No uses emojis, markdown, asteriscos, ni símbolos decorativos.",
            "",
            `Fecha actual del sistema: ${today}. Zona horaria local: ${timeZone} (${timeZoneOffset}).`,
            "Usa las tools disponibles para consultar, crear o actualizar parcialmente clientes, empresas y contactos cuando corresponda.",
            "Antes de crear un cliente, empresa o contacto, buscá si ya existe para evitar duplicados.",
            "Cuando relaciones contactos con clientes o empresas, usá los ids existentes obtenidos con las tools de búsqueda."
        ].join("\n");
    }
}

export default CrmAgent
export {
    CrmAgent
}
