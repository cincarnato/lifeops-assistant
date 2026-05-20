import {BuilderTool, DraxAgentFactory, AiProviderFactory} from "@drax/ai-back"
import type {
    DraxAgentConfig,
    DraxAgentPromptContext,
    DraxAgentSystemPrompt,
    DraxAgentToolBuilder,
    DraxAgentToolBuilderSource,
    DraxAgentToolSource,
    IPromptTool
} from "@drax/ai-back"
import {TaskServiceFactory} from "../factory/services/TaskServiceFactory.js"
import {TaskBaseSchema} from "../schemas/TaskSchema.js"
import {MemoryServiceFactory} from "../factory/services/MemoryServiceFactory.js"
import {MemoryBaseSchema} from "../schemas/MemorySchema.js"
import PurposeServiceFactory from "../factory/services/PurposeServiceFactory.js";
import {PurposeBaseSchema} from "../schemas/PurposeSchema.js";
import HabitServiceFactory from "../factory/services/HabitServiceFactory.js";
import {HabitBaseSchema} from "../schemas/HabitSchema.js";
import GoalServiceFactory from "../factory/services/GoalServiceFactory.js";
import {GoalBaseSchema} from "../schemas/GoalSchema.js";
import ClientServiceFactory from "../factory/services/ClientServiceFactory.js";
import {ClientBaseSchema} from "../schemas/ClientSchema.js";
import CompanyServiceFactory from "../factory/services/CompanyServiceFactory.js";
import {CompanyBaseSchema} from "../schemas/CompanySchema.js";
import ContactServiceFactory from "../factory/services/ContactServiceFactory.js";
import {ContactBaseSchema} from "../schemas/ContactSchema.js";
import ProjectServiceFactory from "../factory/services/ProjectServiceFactory.js";
import {ProjectBaseSchema} from "../schemas/ProjectSchema.js";
import SourceServiceFactory from "../factory/services/SourceServiceFactory.js";
import TaskStatusServiceFactory from "../factory/services/TaskStatusServiceFactory.js";
import TaskTypeServiceFactory from "../factory/services/TaskTypeServiceFactory.js";
import PriorityServiceFactory from "../factory/services/PriorityServiceFactory.js";
import MemoryTypeServiceFactory from "../factory/services/MemoryTypeServiceFactory.js";
import LifeAreaServiceFactory from "../factory/services/LifeAreaServiceFactory.js";
import GoogleCalendarTools from "../../google/tools/GoogleCalendarTools.js";
import GoogleContactsTools from "../../google/tools/GoogleContactsTools.js";
import GoogleGmailTools from "../../google/tools/GoogleGmailTools.js";
import PushNotificationTools from "../../push/tools/PushNotificationTools.js";

interface TaskOptionNames {
    sources: string[];
    statuses: string[];
    types: string[];
    priorities: string[];
    lifeAreas: string[];
}

interface MemoryOptionNames {
    types: string[];
}

interface AgentOptionNames {
    tasks: TaskOptionNames;
    memories: MemoryOptionNames;
}

interface ActivePurposePromptContext {
    title: string;
    statement: string;
}

interface GoalPromptContext {
    _id: string;
    name: string;
    description?: string;
}

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

type AgentConfigToolSource =
    | IPromptTool
    | IPromptTool[]
    | ((context: DraxAgentPromptContext) => IPromptTool | IPromptTool[] | Promise<IPromptTool | IPromptTool[]>);

class AgentConfigService {
    private static service: AgentConfigService;

    private _systemPrompt = "";
    private _taskTool?: DraxAgentToolBuilder;
    private _memoryTool?: DraxAgentToolBuilder;
    private _purposeTool?: DraxAgentToolBuilder;
    private _habitTool?: DraxAgentToolBuilder;
    private _goalTool?: DraxAgentToolBuilder;
    private _clientTool?: DraxAgentToolBuilder;
    private _companyTool?: DraxAgentToolBuilder;
    private _contactTool?: DraxAgentToolBuilder;
    private _projectTool?: DraxAgentToolBuilder;
    private _tools: AgentConfigToolSource[] = [];
    private _googleToolsInitialized = false;
    private _pushToolsInitialized = false;
    private _initialized = false;
    private _optionNames: AgentOptionNames = {
        tasks: {
            sources: [],
            statuses: [],
            types: [],
            priorities: [],
            lifeAreas: []
        },
        memories: {
            types: []
        }
    };

    public static get instance(): AgentConfigService {
        if (!AgentConfigService.service) {
            AgentConfigService.service = new AgentConfigService();
        }

        return AgentConfigService.service;
    }

    public async initializeAgent(): Promise<void> {
        await this.prepare();
        DraxAgentFactory.instance().configure(this.buildAgentConfig());
        DraxAgentFactory.instance("mindset").configure(this.buildMindsetAgentConfig());
        DraxAgentFactory.instance("CRM", "Especialista en clientes, empresas y contactos").configure(this.buildCrmAgentConfig());
        this._initialized = true;
    }

    public addTool(tool: AgentConfigToolSource): this {
        this._tools.push(tool);

        if (this._initialized) {
            DraxAgentFactory.instance().setTools(this.tools);
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
        this.prepareMemoryTool();
        this.prepareClientTool();
        this.prepareCrmTools();
        this.prepareProjectTool();
        this.prepareMindsetTools();
        this.prepareGoogleTools();
        this.preparePushTools();
        await this.prepareSystemPrompt();
    }

    public async prepareSystemPrompt(): Promise<string> {
        this._optionNames = await this.fetchOptionNames();
        this._systemPrompt = this.buildSystemPrompt(this._optionNames);

        return this._systemPrompt;
    }

    public async refreshSystemPrompt(): Promise<string> {
        const systemPrompt = await this.prepareSystemPrompt();

        if (this._initialized) {
            DraxAgentFactory.instance().setSystemPrompt(this.buildDefaultSystemPrompt());
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
                methods: ["search", "findFirst", "findLast","create", "updatePartial", "groupBy"],
                schema: TaskBaseSchema,
                service: TaskServiceFactory.instance
            });
        }

        return this._taskTool;
    }

    public prepareMemoryTool(): DraxAgentToolBuilder {
        if (!this._memoryTool) {
            this._memoryTool = new BuilderTool({
                entityDescription: "Memorias",
                entityName: "Memory",
                methods: ["search", "create", "updatePartial", "groupBy"],
                schema: MemoryBaseSchema,
                service: MemoryServiceFactory.instance
            });
        }

        return this._memoryTool;
    }

    public preparePurposeTool(): DraxAgentToolBuilder {
        if (!this._purposeTool) {
            this._purposeTool = new BuilderTool({
                entityDescription: "Propósitos",
                entityName: "Purpose",
                methods: ["search", "create", "updatePartial"],
                schema: PurposeBaseSchema,
                service: PurposeServiceFactory.instance
            });
        }

        return this._purposeTool;
    }

    public prepareHabitTool(): DraxAgentToolBuilder {
        if (!this._habitTool) {
            this._habitTool = new BuilderTool({
                entityDescription: "Hábitos",
                entityName: "Habit",
                methods: ["search", "create", "updatePartial"],
                schema: HabitBaseSchema,
                service: HabitServiceFactory.instance
            });
        }

        return this._habitTool;
    }

    public prepareGoalTool(): DraxAgentToolBuilder {
        if (!this._goalTool) {
            this._goalTool = new BuilderTool({
                entityDescription: "Objetivos",
                entityName: "Goal",
                methods: ["search", "create", "updatePartial"],
                schema: GoalBaseSchema,
                service: GoalServiceFactory.instance
            });
        }

        return this._goalTool;
    }

    public prepareClientTool(): DraxAgentToolBuilder {
        if (!this._clientTool) {
            this._clientTool = new BuilderTool({
                entityDescription: "Clientes",
                entityName: "Client",
                methods: ["search", "create", "updatePartial"],
                schema: ClientBaseSchema,
                service: ClientServiceFactory.instance
            });
        }

        return this._clientTool;
    }

    public prepareCompanyTool(): DraxAgentToolBuilder {
        if (!this._companyTool) {
            this._companyTool = new BuilderTool({
                entityDescription: "Empresas",
                entityName: "Company",
                methods: ["search", "create", "updatePartial"],
                schema: CompanyBaseSchema,
                service: CompanyServiceFactory.instance
            });
        }

        return this._companyTool;
    }

    public prepareContactTool(): DraxAgentToolBuilder {
        if (!this._contactTool) {
            this._contactTool = new BuilderTool({
                entityDescription: "Contactos",
                entityName: "Contact",
                methods: ["search", "create", "updatePartial"],
                schema: ContactBaseSchema,
                service: ContactServiceFactory.instance
            });
        }

        return this._contactTool;
    }

    public prepareProjectTool(): DraxAgentToolBuilder {
        if (!this._projectTool) {
            this._projectTool = new BuilderTool({
                entityDescription: "Proyectos",
                entityName: "Project",
                methods: ["search", "create", "updatePartial"],
                schema: ProjectBaseSchema,
                service: ProjectServiceFactory.instance
            });
        }

        return this._projectTool;
    }

    public prepareMindsetTools(): void {
        this.preparePurposeTool();
        this.prepareHabitTool();
        this.prepareGoalTool();
    }

    public prepareCrmTools(): void {
        this.prepareClientTool();
        this.prepareCompanyTool();
        this.prepareContactTool();
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
            },
            context => {
                const userId = this.resolveContextUserId(context);
                if (!userId) {
                    return [];
                }

                return GoogleContactsTools.build({userId});
            }
        ]);

        this._googleToolsInitialized = true;
    }

    public preparePushTools(): void {
        if (this._pushToolsInitialized) {
            return;
        }

        this.addTool(context => {
            const userId = this.resolveContextUserId(context);
            if (!userId) {
                return [];
            }

            return PushNotificationTools.build({userId});
        });

        this._pushToolsInitialized = true;
    }

    public get systemPrompt(): string {
        return this._systemPrompt;
    }

    public get taskTool(): DraxAgentToolBuilder {
        return this.prepareTaskTool();
    }

    public get memoryTool(): DraxAgentToolBuilder {
        return this.prepareMemoryTool();
    }

    public get purposeTool(): DraxAgentToolBuilder {
        return this.preparePurposeTool();
    }

    public get habitTool(): DraxAgentToolBuilder {
        return this.prepareHabitTool();
    }

    public get goalTool(): DraxAgentToolBuilder {
        return this.prepareGoalTool();
    }

    public get clientTool(): DraxAgentToolBuilder {
        return this.prepareClientTool();
    }

    public get companyTool(): DraxAgentToolBuilder {
        return this.prepareCompanyTool();
    }

    public get contactTool(): DraxAgentToolBuilder {
        return this.prepareContactTool();
    }

    public get projectTool(): DraxAgentToolBuilder {
        return this.prepareProjectTool();
    }

    public get toolBuilders(): DraxAgentToolBuilderSource {
        return [
            this.taskTool,
            this.memoryTool,
            this.clientTool,
            this.projectTool
        ];
    }

    public get crmToolBuilders(): DraxAgentToolBuilderSource {
        return [
            this.clientTool,
            this.companyTool,
            this.contactTool
        ];
    }

    public get mindsetToolBuilders(): DraxAgentToolBuilderSource {
        return [
            this.purposeTool,
            this.habitTool,
            this.goalTool
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
        return this._optionNames.tasks;
    }

    public get memoryOptionNames(): MemoryOptionNames {
        return this._optionNames.memories;
    }

    private get logToolExecution(): boolean {
        const value = process.env.AGENT_LOG_TOOL_EXECUTION;

        if (value === undefined) {
            return false;
        }

        return !["false", "0", "no", "off"].includes(value.trim().toLowerCase());
    }

    public buildAgentConfig(overrides: Partial<DraxAgentConfig> = {}): DraxAgentConfig {
        return {
            systemPrompt: this.buildDefaultSystemPrompt(),
            toolBuilders: this.toolBuilders,
            tools: this.tools,
            logToolExecution: this.logToolExecution,
            ...overrides
        };
    }

    public buildMindsetAgentConfig(overrides: Partial<DraxAgentConfig> = {}): DraxAgentConfig {
        return {
            systemPrompt: this.buildMindsetSystemPrompt(),
            toolBuilders: this.mindsetToolBuilders,
            tools: [],
            logToolExecution: this.logToolExecution,
            ...overrides
        };
    }

    public buildCrmAgentConfig(overrides: Partial<DraxAgentConfig> = {}): DraxAgentConfig {
        return {
            systemPrompt: this.buildCrmSystemPrompt(),
            toolBuilders: this.crmToolBuilders,
            tools: [],
            logToolExecution: this.logToolExecution,
            ...overrides
        };
    }

    public buildJobAgentConfig(agent: AgentConfigJobAgent): DraxAgentConfig {
        const allowedTools = new Set(agent.allowedTools ?? []);
        const shouldFilterTools = allowedTools.size > 0;
        const shouldAdaptToolBuilders = shouldFilterTools || Boolean(agent.onToolCall);

        return this.buildAgentConfig({
            provider: AiProviderFactory.instance(process.env.AI_PROVIDER || "OpenAi"),
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

    private buildDefaultSystemPrompt(): DraxAgentSystemPrompt {
        return async context => this.buildSystemPromptWithLifeOpsContext(context);
    }

    private async buildSystemPromptWithLifeOpsContext(context: DraxAgentPromptContext): Promise<string> {
        const sections = [this.systemPrompt];
        const lifeOpsContext = await this.buildLifeOpsPromptContext(context);

        if (lifeOpsContext) {
            sections.push("", lifeOpsContext);
        }

        return sections.join("\n");
    }

    private async buildLifeOpsPromptContext(context: DraxAgentPromptContext): Promise<string> {
        try {
            const userId = this.resolveContextUserId(context);
            const [purpose, goals] = await Promise.all([
                this.fetchActivePurposePromptContext(),
                userId ? this.fetchGoalPromptContext(userId) : Promise.resolve([])
            ]);

            if (!purpose && goals.length === 0) {
                return "";
            }

            return this.formatLifeOpsPromptContext(purpose, goals);
        } catch (e) {
            console.error("Error building LifeOps prompt context", {
                name: e?.name,
                message: e?.message,
                stack: e?.stack
            });

            return "";
        }
    }

    private async fetchActivePurposePromptContext(): Promise<ActivePurposePromptContext | null> {
        const purposes = await PurposeServiceFactory.instance.findFirst(1, [
            {field: "active", operator: "eq", value: true}
        ]);
        const purpose = purposes[0];

        if (!purpose) {
            return null;
        }

        return {
            title: purpose.title,
            statement: purpose.statement
        };
    }

    private async fetchGoalPromptContext(userId: string): Promise<GoalPromptContext[]> {
        const goals = await GoalServiceFactory.instance.find({
            limit: 50,
            orderBy: "name",
            order: "asc",
            filters: [
                {field: "user", operator: "eq", value: userId}
            ]
        });

        return goals
            .filter(goal => goal?._id && goal?.name)
            .map(goal => ({
                _id: String(goal._id),
                name: goal.name,
                description: goal.description
            }));
    }

    private formatLifeOpsPromptContext(
        purpose: ActivePurposePromptContext | null,
        goals: GoalPromptContext[]
    ): string {
        const lines = [
            "[CONTEXTO LIFEOPS ACTIVO]",
            "Usa este contexto como referencia estable para priorizar, interpretar y relacionar tareas, memorias, proyectos y recomendaciones."
        ];

        if (purpose) {
            lines.push(
                "",
                "Proposito activo:",
                `title: ${this.formatPromptValue(purpose.title)}`,
                `statement: ${this.formatPromptValue(purpose.statement)}`
            );
        }

        if (goals.length > 0) {
            lines.push("", "Objetivos del usuario:");

            for (const goal of goals) {
                lines.push(
                    `- _id: ${this.formatPromptValue(goal._id)}`,
                    `  name: ${this.formatPromptValue(goal.name)}`,
                    `  description: ${this.formatPromptValue(goal.description || "sin descripcion")}`
                );
            }
        }

        return lines.join("\n");
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

    private async fetchOptionNames(): Promise<AgentOptionNames> {
        const [sources, statuses, taskTypes, priorities, lifeAreas, memoryTypes] = await Promise.all([
            SourceServiceFactory.instance.fetchAll(),
            TaskStatusServiceFactory.instance.fetchAll(),
            TaskTypeServiceFactory.instance.fetchAll(),
            PriorityServiceFactory.instance.fetchAll(),
            LifeAreaServiceFactory.instance.fetchAll(),
            MemoryTypeServiceFactory.instance.fetchAll()
        ]);

        return {
            tasks: {
                sources: this.serializeOptionNames(sources),
                statuses: this.serializeOptionNames(statuses),
                types: this.serializeOptionNames(taskTypes),
                priorities: this.serializeOptionNames(priorities),
                lifeAreas: this.serializeOptionNames(lifeAreas)
            },
            memories: {
                types: this.serializeOptionNames(memoryTypes)
            }
        };
    }

    private serializeOptionNames(options: any[]): string[] {
        return options
            .map(option => option?.name)
            .filter((name): name is string => typeof name === "string" && name.trim().length > 0);
    }

    private buildSystemPrompt(options: AgentOptionNames): string {
        const today = this.formatLocalDate(new Date());
        const tomorrow = this.addDays(today, 1);
        const timeZone = this.getLocalTimeZone();
        const timeZoneOffset = this.formatLocalTimeZoneOffset(new Date());

        return [
            "Sos un asistente del sistema. Referite siempre al usuario como Señor. Responde de forma clara y util. Respondé siempre en texto plano. No uses emojis, markdown, asteriscos, ni símbolos decorativos.",
            "",
            `Fecha actual del sistema: ${today}. Zona horaria local: ${timeZone} (${timeZoneOffset}).`,
            `Cuando el usuario use fechas relativas como hoy, mañana, ayer, esta semana o este mes, calcula los rangos a partir de esa fecha actual.`,
            `Para consultar eventos de calendario de hoy, usa timeMin=${today}T00:00:00${timeZoneOffset} y timeMax=${tomorrow}T00:00:00${timeZoneOffset}.`,
            "",
            "Al crear o actualizar tareas o memorias, los campos source, lifeArea y priority guardan solo el nombre como string y usan las mismas opciones disponibles para ambos tipos de entidad:",
            `- source: ${this.formatOptionNames(options.tasks.sources)}`,
            `- lifeArea: ${this.formatOptionNames(options.tasks.lifeAreas)}`,
            `- priority: ${this.formatOptionNames(options.tasks.priorities)}`,
            "",
            "Al crear o actualizar tareas, los campos type y status tambien guardan solo el nombre como string.",
            "Usa unicamente estos nombres disponibles para completar esos campos:",
            `- type: ${this.formatOptionNames(options.tasks.types)}`,
            `- status: ${this.formatOptionNames(options.tasks.statuses)}`,
            "",
            "Al crear o actualizar memorias, el campo type guarda solo el nombre como string.",
            "Usa unicamente estos nombres disponibles para completar ese campo:",
            `- type: ${this.formatOptionNames(options.memories.types)}`,
            "",
            "Cuando necesites avisarle algo al usuario fuera del chat, podes enviarle una push notification usando la tool disponible."
        ].join("\n");
    }

    private formatOptionNames(names: string[]): string {
        if (names.length === 0) {
            return "sin opciones configuradas";
        }

        return names.join(", ");
    }

    private formatPromptValue(value: string): string {
        return value
            .replace(/\s+/g, " ")
            .trim();
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
