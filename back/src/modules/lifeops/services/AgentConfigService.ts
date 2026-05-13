import {BuilderTool, DraxAgent} from "@drax/ai-back"
import type {
    DraxAgentConfig,
    DraxAgentPromptContext,
    DraxAgentToolBuilder,
    DraxAgentToolBuilderSource,
    DraxAgentToolSource,
    IPromptTool
} from "@drax/ai-back"
import {TaskServiceFactory} from "../factory/services/TaskServiceFactory.js"
import {TaskBaseSchema} from "../schemas/TaskSchema.js"
import TaskSourceServiceFactory from "../factory/services/TaskSourceServiceFactory.js";
import TaskStatusServiceFactory from "../factory/services/TaskStatusServiceFactory.js";
import TaskTypeServiceFactory from "../factory/services/TaskTypeServiceFactory.js";
import PriorityServiceFactory from "../factory/services/PriorityServiceFactory.js";
import GoogleCalendarTools from "../../google/tools/GoogleCalendarTools.js";
import GoogleGmailTools from "../../google/tools/GoogleGmailTools.js";

interface TaskOptionNames {
    sources: string[];
    statuses: string[];
    types: string[];
    priorities: string[];
}

type AgentConfigToolSource =
    | IPromptTool
    | IPromptTool[]
    | ((context: DraxAgentPromptContext) => IPromptTool | IPromptTool[] | Promise<IPromptTool | IPromptTool[]>);

class AgentConfigService {
    private static service: AgentConfigService;

    private _systemPrompt = "";
    private _taskTool?: DraxAgentToolBuilder;
    private _tools: AgentConfigToolSource[] = [];
    private _googleToolsInitialized = false;
    private _initialized = false;
    private _taskOptionNames: TaskOptionNames = {
        sources: [],
        statuses: [],
        types: [],
        priorities: []
    };

    public static get instance(): AgentConfigService {
        if (!AgentConfigService.service) {
            AgentConfigService.service = new AgentConfigService();
        }

        return AgentConfigService.service;
    }

    public async initializeAgent(): Promise<void> {
        await this.prepare();
        DraxAgent.instance().configure(this.buildAgentConfig());
        this._initialized = true;
    }

    public addTool(tool: AgentConfigToolSource): this {
        this._tools.push(tool);

        if (this._initialized) {
            DraxAgent.instance().setTools(this.tools);
        }

        return this;
    }

    public addTools(tools: AgentConfigToolSource[]): this {
        for (const tool of tools) {
            this.addTool(tool);
        }

        return this;
    }

    public async prepare(): Promise<void> {
        this.prepareTaskTool();
        this.prepareGoogleTools();
        await this.prepareSystemPrompt();
    }

    public async prepareSystemPrompt(): Promise<string> {
        this._taskOptionNames = await this.fetchTaskOptionNames();
        this._systemPrompt = this.buildSystemPrompt(this._taskOptionNames);

        return this._systemPrompt;
    }

    public async refreshSystemPrompt(): Promise<string> {
        const systemPrompt = await this.prepareSystemPrompt();

        if (this._initialized) {
            DraxAgent.instance().setSystemPrompt(systemPrompt);
        }

        return systemPrompt;
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

    public prepareTaskTool(): DraxAgentToolBuilder {
        if (!this._taskTool) {
            this._taskTool = new BuilderTool({
                entityDescription: "Tareas",
                entityName: "Task",
                methods: ["search", "find", "create", "updatePartial", "groupBy"],
                schema: TaskBaseSchema,
                service: TaskServiceFactory.instance
            });
        }

        return this._taskTool;
    }

    public prepareGoogleTools(): void {
        if (this._googleToolsInitialized) {
            return;
        }

        this.addTools([
            context => {
                const userId = this.resolveContextUserId(context);
                if (!userId) {
                    return [];
                }

                return GoogleCalendarTools.build({userId});
            },
            context => {
                const userId = this.resolveContextUserId(context);
                if (!userId) {
                    return [];
                }

                return GoogleGmailTools.build({userId});
            }
        ]);

        this._googleToolsInitialized = true;
    }

    public get systemPrompt(): string {
        return this._systemPrompt;
    }

    public get taskTool(): DraxAgentToolBuilder {
        return this.prepareTaskTool();
    }

    public get toolBuilders(): DraxAgentToolBuilderSource {
        return [
           // this.taskTool
        ];
    }

    public get tools(): DraxAgentToolSource {
        return async (context: DraxAgentPromptContext) => {
            const tools = await Promise.all(
                this._tools.map(async toolSource => {
                    const resolved = typeof toolSource === "function"
                        ? await toolSource(context)
                        : toolSource;

                    return Array.isArray(resolved) ? resolved : [resolved];
                })
            );

            return tools.flat();
        };
    }

    public get taskOptionNames(): TaskOptionNames {
        return this._taskOptionNames;
    }

    private buildAgentConfig(): DraxAgentConfig {
        return {
            systemPrompt: this.systemPrompt,
            toolBuilders: this.toolBuilders,
            tools: this.tools
        };
    }

    private async fetchTaskOptionNames(): Promise<TaskOptionNames> {
        const [sources, statuses, types, priorities] = await Promise.all([
            TaskSourceServiceFactory.instance.fetchAll(),
            TaskStatusServiceFactory.instance.fetchAll(),
            TaskTypeServiceFactory.instance.fetchAll(),
            PriorityServiceFactory.instance.fetchAll()
        ]);

        return {
            sources: this.serializeOptionNames(sources),
            statuses: this.serializeOptionNames(statuses),
            types: this.serializeOptionNames(types),
            priorities: this.serializeOptionNames(priorities)
        };
    }

    private serializeOptionNames(options: any[]): string[] {
        return options
            .map(option => option?.name)
            .filter((name): name is string => typeof name === "string" && name.trim().length > 0);
    }

    private buildSystemPrompt(options: TaskOptionNames): string {
        const today = this.formatLocalDate(new Date());
        const tomorrow = this.addDays(today, 1);
        const timeZone = this.getLocalTimeZone();
        const timeZoneOffset = this.formatLocalTimeZoneOffset(new Date());

        return [
            "Sos un asistente del sistema. Responde de forma clara, breve y util.",
            "",
            `Fecha actual del sistema: ${today}. Zona horaria local: ${timeZone} (${timeZoneOffset}).`,
            `Cuando el usuario use fechas relativas como hoy, mañana, ayer, esta semana o este mes, calcula los rangos a partir de esa fecha actual.`,
            `Para consultar eventos de calendario de hoy, usa timeMin=${today}T00:00:00${timeZoneOffset} y timeMax=${tomorrow}T00:00:00${timeZoneOffset}.`,
            "",
            "Al crear o actualizar tareas, los campos source, type, status y priority guardan solo el nombre como string.",
            "Usa unicamente estos nombres disponibles para completar esos campos:",
            `- source: ${this.formatOptionNames(options.sources)}`,
            `- type: ${this.formatOptionNames(options.types)}`,
            `- status: ${this.formatOptionNames(options.statuses)}`,
            `- priority: ${this.formatOptionNames(options.priorities)}`
        ].join("\n");
    }

    private formatOptionNames(names: string[]): string {
        if (names.length === 0) {
            return "sin opciones configuradas";
        }

        return names.join(", ");
    }

    private resolveContextUserId(context: DraxAgentPromptContext): string | null {
        return context.input?.userId ?? context.session.userId ?? null;
    }

    private getLocalTimeZone(): string {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "timezone local del servidor";
    }

    private formatLocalDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    private addDays(date: string, days: number): string {
        const [year, month, day] = date.split("-").map(Number);
        const nextDate = new Date(year, month - 1, day + days);

        return this.formatLocalDate(nextDate);
    }

    private formatLocalTimeZoneOffset(date: Date): string {
        const offsetMinutes = -date.getTimezoneOffset();
        const sign = offsetMinutes >= 0 ? "+" : "-";
        const absoluteMinutes = Math.abs(offsetMinutes);
        const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
        const minutes = String(absoluteMinutes % 60).padStart(2, "0");

        return `${sign}${hours}:${minutes}`;
    }
}

export default AgentConfigService
export {
    AgentConfigService
}
export type {AgentConfigToolSource}
