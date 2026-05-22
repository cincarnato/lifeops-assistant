import {BuilderTool} from "@drax/ai-back"
import type {
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

    public prepareTaskTool(): DraxAgentToolBuilder {
        if (!this._taskTool) {
            this._taskTool = new BuilderTool({
                entityDescription: "Tareas",
                entityName: "Task",
                methods: ["search", "findFirst", "findLast", "create", "updatePartial", "groupBy"],
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
            "Sos asistente del sistema. Usuario=Señor. Responde claro, util, texto plano; sin emojis, markdown, asteriscos ni adornos.",
            `Fecha=${today}. TZ=${timeZone} (${timeZoneOffset}). Relativas: rangos desde Fecha. Calendario hoy: timeMin=${today}T00:00:00${timeZoneOffset}, timeMax=${tomorrow}T00:00:00${timeZoneOffset}.`,
            "Tareas/Task y Memorias/Memory: campos source/lifeArea/priority=nombre string; solo opciones:",
            `- source: ${this.formatOptionNames(options.tasks.sources)}`,
            `- lifeArea: ${this.formatOptionNames(options.tasks.lifeAreas)}`,
            `- priority: ${this.formatOptionNames(options.tasks.priorities)}`,
            "Tareas/Task: type/status solo opciones; ",
            `- Task.type: ${this.formatOptionNames(options.tasks.types)}`,
            `- Task.status: ${this.formatOptionNames(options.tasks.statuses)}`,
            `- Task.project: _id Project; Busca _id en tool Project.`,
            `- Task.goals: _id[] Goal; Busca ids con tools Goal.`,
            `Memory.type=nombre string; solo opciones: ${this.formatOptionNames(options.memories.types)}`,
            "Mail: to=email valido del contacto buscado. Avisos fuera del chat: push notification."
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
