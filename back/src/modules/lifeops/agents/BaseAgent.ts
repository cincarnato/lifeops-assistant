import {BuildContextTool} from "@drax/ai-back"
import type {
    BuildContextToolOptions,
    DraxAgentConfig,
    DraxAgentPromptContext,
    DraxAgentToolBuilder,
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
import TaskPermissions from "../permissions/TaskPermissions.js";
import MemoryPermissions from "../permissions/MemoryPermissions.js";
import PurposePermissions from "../permissions/PurposePermissions.js";
import HabitPermissions from "../permissions/HabitPermissions.js";
import GoalPermissions from "../permissions/GoalPermissions.js";
import ClientPermissions from "../permissions/ClientPermissions.js";
import CompanyPermissions from "../permissions/CompanyPermissions.js";
import ContactPermissions from "../permissions/ContactPermissions.js";
import ProjectPermissions from "../permissions/ProjectPermissions.js";

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

type AgentConfigToolSource =
    | IPromptTool
    | IPromptTool[]
    | ((context: DraxAgentPromptContext) => IPromptTool | IPromptTool[] | Promise<IPromptTool | IPromptTool[]>);

abstract class BaseAgent {
    private _systemPrompt = "";
    private _tools: AgentConfigToolSource[] = [];
    private _googleToolsInitialized = false;
    private _pushToolsInitialized = false;
    protected _initialized = false;
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

    public abstract buildConfig(overrides?: Partial<DraxAgentConfig>): DraxAgentConfig;

    public addTool(tool: AgentConfigToolSource): this {
        this._tools.push(tool);
        this.onToolsChanged();

        return this;
    }

    public addTools(tools: AgentConfigToolSource[]): this {
        for (const tool of tools) {
            this.addTool(tool);
        }

        return this;
    }

    public async prepare(): Promise<void> {
        await this.prepareSystemPrompt();
    }

    public async prepareSystemPrompt(): Promise<string> {
        this._optionNames = await this.fetchOptionNames();
        this._systemPrompt = this.buildSystemPrompt(this._optionNames);

        return this._systemPrompt;
    }

    public async refreshSystemPrompt(): Promise<string> {
        return this.prepareSystemPrompt();
    }

    protected buildTaskTool(context: DraxAgentPromptContext): DraxAgentToolBuilder {
        return this.buildContextTool({
            entityDescription: "Tareas",
            entityName: "Task",
            methods: ["search", "findFirst", "findLast", "create", "updatePartial", "groupBy"],
            schema: TaskBaseSchema.omit({user: true}),
            service: TaskServiceFactory.instance,
            permission: TaskPermissions,
            userFilter: true,
            userSetter: true,
            userAssert: true
        }, context);
    }

    protected buildMemoryTool(context: DraxAgentPromptContext): DraxAgentToolBuilder {
        return this.buildContextTool({
            entityDescription: "Memorias",
            entityName: "Memory",
            methods: ["search", "create", "updatePartial", "groupBy"],
            schema: MemoryBaseSchema.omit({user: true}),
            service: MemoryServiceFactory.instance,
            permission: MemoryPermissions,
            userFilter: true,
            userSetter: true,
            userAssert: true
        }, context);
    }

    protected buildPurposeTool(context: DraxAgentPromptContext): DraxAgentToolBuilder {
        return this.buildContextTool({
            entityDescription: "Propósitos",
            entityName: "Purpose",
            methods: ["search", "create", "updatePartial"],
            schema: PurposeBaseSchema.omit({user: true}),
            service: PurposeServiceFactory.instance,
            permission: PurposePermissions,
            userFilter: true,
            userSetter: true,
            userAssert: true
        }, context);
    }

    protected buildHabitTool(context: DraxAgentPromptContext): DraxAgentToolBuilder {
        return this.buildContextTool({
            entityDescription: "Hábitos",
            entityName: "Habit",
            methods: ["search", "create", "updatePartial"],
            schema: HabitBaseSchema.omit({user: true}),
            service: HabitServiceFactory.instance,
            permission: HabitPermissions,
            userFilter: true,
            userSetter: true,
            userAssert: true
        }, context);
    }

    protected buildGoalTool(context: DraxAgentPromptContext): DraxAgentToolBuilder {
        return this.buildContextTool({
            entityDescription: "Objetivos",
            entityName: "Goal",
            methods: ["search", "create", "updatePartial"],
            schema: GoalBaseSchema.omit({user: true}),
            service: GoalServiceFactory.instance,
            permission: GoalPermissions,
            userFilter: true,
            userSetter: true,
            userAssert: true
        }, context);
    }

    protected buildClientTool(context: DraxAgentPromptContext): DraxAgentToolBuilder {
        return this.buildContextTool({
            entityDescription: "Clientes",
            entityName: "Client",
            methods: ["search", "create", "updatePartial"],
            schema: ClientBaseSchema.omit({user: true}),
            service: ClientServiceFactory.instance,
            permission: ClientPermissions,
            userFilter: true,
            userSetter: true,
            userAssert: true
        }, context);
    }

    protected buildCompanyTool(context: DraxAgentPromptContext): DraxAgentToolBuilder {
        return this.buildContextTool({
            entityDescription: "Empresas",
            entityName: "Company",
            methods: ["search", "create", "updatePartial"],
            schema: CompanyBaseSchema.omit({user: true}),
            service: CompanyServiceFactory.instance,
            permission: CompanyPermissions,
            userFilter: true,
            userSetter: true,
            userAssert: true
        }, context);
    }

    protected buildContactTool(context: DraxAgentPromptContext): DraxAgentToolBuilder {
        return this.buildContextTool({
            entityDescription: "Contactos",
            entityName: "Contact",
            methods: ["search", "create", "updatePartial"],
            schema: ContactBaseSchema.omit({user: true}),
            service: ContactServiceFactory.instance,
            permission: ContactPermissions,
            userFilter: true,
            userSetter: true,
            userAssert: true
        }, context);
    }

    protected buildProjectTool(context: DraxAgentPromptContext): DraxAgentToolBuilder {
        return this.buildContextTool({
            entityDescription: "Proyectos",
            entityName: "Project",
            methods: ["search", "create", "updatePartial"],
            schema: ProjectBaseSchema.omit({user: true}),
            service: ProjectServiceFactory.instance,
            permission: ProjectPermissions,
            userFilter: true,
            userSetter: true,
            userAssert: true
        }, context);
    }

    protected buildContextTool(
        options: Omit<BuildContextToolOptions, "context">,
        context: DraxAgentPromptContext
    ): DraxAgentToolBuilder {
        return BuildContextTool.fromPromptContext(options, context);
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

    protected get logToolExecution(): boolean {
        const value = process.env.AGENT_LOG_TOOL_EXECUTION;

        if (value === undefined) {
            return false;
        }

        return !["false", "0", "no", "off"].includes(value.trim().toLowerCase());
    }

    protected onToolsChanged(): void {
    }

    protected async buildSystemPromptWithLifeOpsContext(context: DraxAgentPromptContext): Promise<string> {
        const sections = [
            this.systemPrompt,
            "",
            this.buildTemporalPromptContext()
        ];
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
                userId ? this.fetchActivePurposePromptContext(userId) : Promise.resolve(null),
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

    private async fetchActivePurposePromptContext(userId: string): Promise<ActivePurposePromptContext | null> {
        const purposes = await PurposeServiceFactory.instance.findFirst(1, [
            {field: "active", operator: "eq", value: true},
            {field: "user", operator: "eq", value: userId}
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
        return [
            "Sos asistente del sistema. Usuario=Señor. Responde claro, util, texto plano; sin emojis, markdown, asteriscos ni adornos.",
            "Tareas/Task y Memorias/Memory: campos source/lifeArea/priority=nombre string; solo opciones:",
            `- source: ${this.formatOptionNames(options.tasks.sources)}. Default: Asistente`,
            `- lifeArea: ${this.formatOptionNames(options.tasks.lifeAreas)}`,
            `- priority: ${this.formatOptionNames(options.tasks.priorities)}.`,
            "Tareas/Task: type/status solo opciones; ",
            `- Task.type: ${this.formatOptionNames(options.tasks.types)}`,
            `- Task.status: ${this.formatOptionNames(options.tasks.statuses)}`,
            `- Task.project: _id Project; Busca _id en tool Project.`,
            `- Task.goals: _id[] Goal; Busca ids con tools Goal.`,
            `Memory.type=nombre string; solo opciones: ${this.formatOptionNames(options.memories.types)}`,
            "Mail: to=email valido del contacto buscado. Avisos fuera del chat: push notification.",
            "Cuando el usuario no especifique atributos como source, priority, lifeArea, type y status usa tu criterio para completarlo, si no esta nada claro pregunta."
        ].join("\n");
    }

    private buildTemporalPromptContext(): string {
        const now = new Date();
        const today = this.formatLocalDate(now);
        const tomorrow = this.addDays(today, 1);
        const timeZone = this.getLocalTimeZone();
        const timeZoneOffset = this.formatLocalTimeZoneOffset(now);

        return [
            "[CONTEXTO TEMPORAL ACTUAL]",
            `Ahora=${now.toISOString()}. Fecha=${today}. Manana=${tomorrow}. TZ=${timeZone} (${timeZoneOffset}).`,
            `Relativas: interpreta "hoy" como ${today} y "manana" como ${tomorrow}, siempre desde Fecha y TZ actuales.`,
            `Calendario hoy: timeMin=${today}T00:00:00${timeZoneOffset}, timeMax=${tomorrow}T00:00:00${timeZoneOffset}.`,
            `Calendario manana: timeMin=${tomorrow}T00:00:00${timeZoneOffset}. Para crear eventos con hora usa dateTime ISO 8601 e incluye timeZone=${timeZone}.`
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

    protected resolveContextUserId(context: DraxAgentPromptContext): string | null {
        return context.input?.userId ?? context.session.userId ?? null;
    }

    protected getLocalTimeZone(): string {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "timezone local del servidor";
    }

    protected formatLocalDate(date: Date): string {
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

    protected formatLocalTimeZoneOffset(date: Date): string {
        const offsetMinutes = -date.getTimezoneOffset();
        const sign = offsetMinutes >= 0 ? "+" : "-";
        const absoluteMinutes = Math.abs(offsetMinutes);
        const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
        const minutes = String(absoluteMinutes % 60).padStart(2, "0");

        return `${sign}${hours}:${minutes}`;
    }
}

export default BaseAgent
export {
    BaseAgent
}
export type {
    AgentConfigToolSource
}
