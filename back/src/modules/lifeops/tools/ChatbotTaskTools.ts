import type {IDraxFieldFilter} from "@drax/crud-share";
import type {IPromptTool} from "@drax/ai-back/types/interfaces/IAIProvider.js";
import TaskServiceFactory from "../factory/services/TaskServiceFactory.js";
import SourceServiceFactory from "../factory/services/SourceServiceFactory.js";
import TaskStatusServiceFactory from "../factory/services/TaskStatusServiceFactory.js";
import TaskTypeServiceFactory from "../factory/services/TaskTypeServiceFactory.js";
import PriorityServiceFactory from "../factory/services/PriorityServiceFactory.js";
import GoalServiceFactory from "../factory/services/GoalServiceFactory.js";
import ProjectServiceFactory from "../factory/services/ProjectServiceFactory.js";
import ContactServiceFactory from "../factory/services/ContactServiceFactory.js";
import ClientServiceFactory from "../factory/services/ClientServiceFactory.js";
import CompanyServiceFactory from "../factory/services/CompanyServiceFactory.js";
import ContactTypeServiceFactory from "../factory/services/ContactTypeServiceFactory.js";
import CompanyTypeServiceFactory from "../factory/services/CompanyTypeServiceFactory.js";
import ClientTypeServiceFactory from "../factory/services/ClientTypeServiceFactory.js";

interface ChatbotTaskToolsContext {
    userId: string;
}

type TaskOptionKind = "source" | "status" | "type" | "priority";
type LifeOpsEntityKind = "goal" | "project" | "contact" | "client" | "company";

const TASK_GROUP_BY_FIELDS = [
    "source",
    "type",
    "lifeArea",
    "status",
    "priority",
    "project",
    "client",
    "dueDate",
    "scheduledDate",
    "completedAt",
    "createdAt",
    "updatedAt",
    "archivedAt",
    "valueScore",
    "motivationScore",
    "effortScore",
    "urgencyScore",
] as const;

const TASK_GROUP_BY_DATE_FORMATS = ["year", "month", "day", "hour", "minute", "second"] as const;

interface TaskOptionNames {
    sources: string[];
    statuses: string[];
    types: string[];
    priorities: string[];
}

interface EntityTypeOptionNames {
    contactTypes: string[];
    companyTypes: string[];
    clientTypes: string[];
}

interface LifeOpsOptionNames {
    task: TaskOptionNames;
    entityTypes: EntityTypeOptionNames;
}

interface EntityToolConfig {
    kind: LifeOpsEntityKind;
    plural: string;
    serviceFactory: { instance: any };
    createProperties: Record<string, any>;
    updateProperties: Record<string, any>;
    requiredCreateFields: string[];
    serialize: (entity: any) => any;
}

class ChatbotTaskTools {
    static build(context: ChatbotTaskToolsContext): IPromptTool[] {
        return [
            this.registerTaskTool(context),
            this.searchTasksTool(context),
            this.findTaskByIdTool(context),
            this.groupTasksTool(context),
            this.updateTaskPartialTool(context),
            this.listTaskOptionsTool(),
            this.createTaskOptionTool("source"),
            this.createTaskOptionTool("status"),
            this.createTaskOptionTool("type"),
            this.createTaskOptionTool("priority"),
            ...this.buildEntityTools(context),
        ];
    }

    static async fetchTaskOptionNames(): Promise<TaskOptionNames> {
        const [sources, statuses, types, priorities] = await Promise.all([
            SourceServiceFactory.instance.fetchAll(),
            TaskStatusServiceFactory.instance.fetchAll(),
            TaskTypeServiceFactory.instance.fetchAll(),
            PriorityServiceFactory.instance.fetchAll(),
        ]);

        return {
            sources: this.serializeOptionNames(sources),
            statuses: this.serializeOptionNames(statuses),
            types: this.serializeOptionNames(types),
            priorities: this.serializeOptionNames(priorities),
        };
    }

    static async fetchLifeOpsOptionNames(): Promise<LifeOpsOptionNames> {
        const [task, contactTypes, companyTypes, clientTypes] = await Promise.all([
            this.fetchTaskOptionNames(),
            ContactTypeServiceFactory.instance.fetchAll(),
            CompanyTypeServiceFactory.instance.fetchAll(),
            ClientTypeServiceFactory.instance.fetchAll(),
        ]);

        return {
            task,
            entityTypes: {
                contactTypes: this.serializeOptionNames(contactTypes),
                companyTypes: this.serializeOptionNames(companyTypes),
                clientTypes: this.serializeOptionNames(clientTypes),
            },
        };
    }

    private static taskUserFilter(userId: string): IDraxFieldFilter {
        return {field: "user", operator: "eq", value: userId};
    }

    private static compactObject<T extends Record<string, any>>(data: T): T {
        return Object.fromEntries(
            Object.entries(data).filter(([, value]) => value !== undefined)
        ) as T;
    }

    private static serializeOptionNames(options: any[]): string[] {
        return options
            .map(option => option?.name)
            .filter((name): name is string => typeof name === "string" && name.trim().length > 0);
    }

    private static serializeTask(task: any) {
        if (!task) {
            return null;
        }

        return {
            _id: task._id,
            title: task.title,
            description: task.description,
            source: task.source,
            type: task.type,
            lifeArea: task.lifeArea,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            scheduledDate: task.scheduledDate,
            completedAt: task.completedAt,
            tags: task.tags,
            notes: task.notes,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
        };
    }

    private static entityUserFilter(userId: string): IDraxFieldFilter {
        return {field: "user", operator: "eq", value: userId};
    }

    private static serializeGoal(goal: any) {
        return this.serializeFields(goal, [
            "_id", "name", "description", "status", "priority", "valueScore", "motivationScore",
            "effortScore", "lifeArea", "timeHorizon", "targetDate", "completedAt", "archivedAt",
            "progressPercent", "createdAt", "updatedAt",
        ]);
    }

    private static serializeProject(project: any) {
        return this.serializeFields(project, [
            "_id", "name", "description", "status", "priority", "goals", "client", "valueScore",
            "motivationScore", "effortScore", "priorityScore", "startDate", "targetDate", "completedAt",
            "progressPercent", "aliases", "tags", "archivedAt", "createdAt", "updatedAt",
        ]);
    }

    private static serializeContact(contact: any) {
        return this.serializeFields(contact, [
            "_id", "source", "externalProvider", "externalId", "displayName", "givenName", "familyName",
            "nickname", "emails", "phones", "organization", "addresses", "photoUrl", "birthday", "notes",
            "tags", "status", "lastSyncedAt", "createdAt", "updatedAt",
        ]);
    }

    private static serializeClient(client: any) {
        return this.serializeFields(client, [
            "_id", "name", "description", "type", "status", "priority", "valueScore", "relationshipScore",
            "priorityScore", "website", "emailDomains", "company", "mainContact", "redmineProjectIds",
            "aliases", "tags", "notes", "archivedAt", "createdAt", "updatedAt",
        ]);
    }

    private static serializeCompany(company: any) {
        return this.serializeFields(company, [
            "_id", "name", "legalName", "taxIdType", "taxIdNumber", "description", "type", "status",
            "website", "aliases", "emailDomains", "tags", "notes", "archivedAt", "createdAt", "updatedAt",
        ]);
    }

    private static serializeFields(entity: any, fields: string[]) {
        if (!entity) {
            return null;
        }

        return Object.fromEntries(fields.map(field => [field, entity[field]]));
    }

    private static async findUserTaskById(id: string, userId: string) {
        const taskService = TaskServiceFactory.instance;
        return await taskService.findOneBy("_id", id, [this.taskUserFilter(userId)]);
    }

    private static async findUserEntityById(config: EntityToolConfig, id: string, userId: string) {
        return await config.serviceFactory.instance.findOneBy("_id", id, [this.entityUserFilter(userId)]);
    }

    private static buildEntityTools(context: ChatbotTaskToolsContext): IPromptTool[] {
        return this.entityConfigs().flatMap(config => [
            this.createEntityTool(context, config),
            this.searchEntitiesTool(context, config),
            this.findEntityByIdTool(context, config),
            this.updateEntityPartialTool(context, config),
        ]);
    }

    private static entityConfigs(): EntityToolConfig[] {
        const scoreProperty = {type: "number", minimum: 1, maximum: 10};
        const nullableDateProperty = {type: ["string", "null"], description: "Fecha ISO 8601 o null para limpiar."};
        const tagArrayProperty = {type: "array", items: {type: "string"}};

        return [
            {
                kind: "goal",
                plural: "goals",
                serviceFactory: GoalServiceFactory,
                requiredCreateFields: ["name"],
                serialize: (entity: any) => this.serializeGoal(entity),
                createProperties: {
                    name: {type: "string", description: "Nombre breve del objetivo."},
                    description: {type: "string"},
                    status: {type: "string", enum: ["draft", "active", "paused", "completed", "cancelled", "archived"]},
                    priority: {type: "string", enum: ["low", "medium", "high", "critical"]},
                    valueScore: scoreProperty,
                    motivationScore: scoreProperty,
                    effortScore: scoreProperty,
                    lifeArea: {type: "string"},
                    timeHorizon: {type: "string", enum: ["short_term", "medium_term", "long_term"]},
                    targetDate: {type: "string", description: "Fecha objetivo en formato ISO 8601."},
                    completedAt: {type: "string", description: "Fecha de completado en formato ISO 8601."},
                    progressPercent: {type: "number", minimum: 0, maximum: 100},
                },
                updateProperties: {
                    name: {type: "string"},
                    description: {type: "string"},
                    status: {type: "string", enum: ["draft", "active", "paused", "completed", "cancelled", "archived"]},
                    priority: {type: "string", enum: ["low", "medium", "high", "critical"]},
                    valueScore: scoreProperty,
                    motivationScore: scoreProperty,
                    effortScore: scoreProperty,
                    lifeArea: {type: "string"},
                    timeHorizon: {type: "string", enum: ["short_term", "medium_term", "long_term"]},
                    targetDate: nullableDateProperty,
                    completedAt: nullableDateProperty,
                    archivedAt: nullableDateProperty,
                    progressPercent: {type: "number", minimum: 0, maximum: 100},
                },
            },
            {
                kind: "project",
                plural: "projects",
                serviceFactory: ProjectServiceFactory,
                requiredCreateFields: ["name"],
                serialize: (entity: any) => this.serializeProject(entity),
                createProperties: {
                    name: {type: "string", description: "Nombre breve del proyecto."},
                    description: {type: "string"},
                    status: {type: "string", enum: ["idea", "active", "paused", "completed", "cancelled", "archived"]},
                    priority: {type: "string", enum: ["low", "medium", "high", "critical"]},
                    goals: {type: "array", items: {type: "string"}, description: "IDs de objetivos relacionados."},
                    client: {type: "string", description: "ID del cliente relacionado."},
                    valueScore: scoreProperty,
                    motivationScore: scoreProperty,
                    effortScore: scoreProperty,
                    priorityScore: {type: "number"},
                    startDate: {type: "string", description: "Fecha de inicio en formato ISO 8601."},
                    targetDate: {type: "string", description: "Fecha objetivo en formato ISO 8601."},
                    completedAt: {type: "string", description: "Fecha de completado en formato ISO 8601."},
                    progressPercent: {type: "number", minimum: 0, maximum: 100},
                    aliases: tagArrayProperty,
                    tags: tagArrayProperty,
                },
                updateProperties: {
                    name: {type: "string"},
                    description: {type: "string"},
                    status: {type: "string", enum: ["idea", "active", "paused", "completed", "cancelled", "archived"]},
                    priority: {type: "string", enum: ["low", "medium", "high", "critical"]},
                    goals: {type: "array", items: {type: "string"}},
                    client: {type: ["string", "null"], description: "ID del cliente o null para limpiar."},
                    valueScore: {type: ["number", "null"]},
                    motivationScore: {type: ["number", "null"]},
                    effortScore: {type: ["number", "null"]},
                    priorityScore: {type: ["number", "null"]},
                    startDate: nullableDateProperty,
                    targetDate: nullableDateProperty,
                    completedAt: nullableDateProperty,
                    archivedAt: nullableDateProperty,
                    progressPercent: {type: ["number", "null"], minimum: 0, maximum: 100},
                    aliases: tagArrayProperty,
                    tags: tagArrayProperty,
                },
            },
            {
                kind: "contact",
                plural: "contacts",
                serviceFactory: ContactServiceFactory,
                requiredCreateFields: ["displayName"],
                serialize: (entity: any) => this.serializeContact(entity),
                createProperties: {
                    source: {type: "string", enum: ["manual", "google", "imported", "api"]},
                    displayName: {type: "string"},
                    givenName: {type: "string"},
                    familyName: {type: "string"},
                    nickname: {type: "string"},
                    emails: {type: "array", items: {type: "object", properties: {value: {type: "string"}, type: {type: "string"}, primary: {type: "boolean"}, displayName: {type: "string"}}, required: ["value"]}},
                    phones: {type: "array", items: {type: "object", properties: {value: {type: "string"}, normalizedValue: {type: "string"}, type: {type: "string"}, primary: {type: "boolean"}}, required: ["value"]}},
                    organization: {type: "object", properties: {name: {type: "string"}, title: {type: "string"}, department: {type: "string"}, domain: {type: "string"}}},
                    addresses: {type: "array", items: {type: "object", properties: {formattedValue: {type: "string"}, type: {type: "string"}, streetAddress: {type: "string"}, city: {type: "string"}, region: {type: "string"}, postalCode: {type: "string"}, country: {type: "string"}, countryCode: {type: "string"}, primary: {type: "boolean"}}}},
                    tags: tagArrayProperty,
                    status: {type: "string", enum: ["active", "archived", "deleted"]},
                    notes: {type: "string"},
                },
                updateProperties: {
                    source: {type: "string", enum: ["manual", "google", "imported", "api"]},
                    displayName: {type: "string"},
                    givenName: {type: "string"},
                    familyName: {type: "string"},
                    nickname: {type: "string"},
                    emails: {type: "array", items: {type: "object", properties: {value: {type: "string"}, type: {type: "string"}, primary: {type: "boolean"}, displayName: {type: "string"}}, required: ["value"]}},
                    phones: {type: "array", items: {type: "object", properties: {value: {type: "string"}, normalizedValue: {type: "string"}, type: {type: "string"}, primary: {type: "boolean"}}, required: ["value"]}},
                    organization: {type: "object", properties: {name: {type: "string"}, title: {type: "string"}, department: {type: "string"}, domain: {type: "string"}}},
                    addresses: {type: "array", items: {type: "object", properties: {formattedValue: {type: "string"}, type: {type: "string"}, streetAddress: {type: "string"}, city: {type: "string"}, region: {type: "string"}, postalCode: {type: "string"}, country: {type: "string"}, countryCode: {type: "string"}, primary: {type: "boolean"}}}},
                    tags: tagArrayProperty,
                    status: {type: "string", enum: ["active", "archived", "deleted"]},
                    notes: {type: "string"},
                    lastSyncedAt: nullableDateProperty,
                },
            },
            {
                kind: "client",
                plural: "clients",
                serviceFactory: ClientServiceFactory,
                requiredCreateFields: ["name"],
                serialize: (entity: any) => this.serializeClient(entity),
                createProperties: {
                    name: {type: "string"},
                    description: {type: "string"},
                    type: {type: "string", description: "Nombre de ClientType si el usuario eligio una opcion existente."},
                    status: {type: "string", enum: ["active", "inactive", "prospect", "paused", "archived"]},
                    priority: {type: "string", enum: ["low", "medium", "high", "critical"]},
                    valueScore: scoreProperty,
                    relationshipScore: scoreProperty,
                    priorityScore: {type: "number"},
                    website: {type: "string"},
                    aliases: tagArrayProperty,
                    emailDomains: tagArrayProperty,
                    company: {type: "string", description: "ID de la empresa relacionada."},
                    mainContact: {type: "string", description: "ID del contacto principal."},
                    redmineProjectIds: tagArrayProperty,
                    tags: tagArrayProperty,
                    notes: {type: "string"},
                },
                updateProperties: {
                    name: {type: "string"},
                    description: {type: "string"},
                    type: {type: "string", description: "Nombre de ClientType."},
                    status: {type: "string", enum: ["active", "inactive", "prospect", "paused", "archived"]},
                    priority: {type: "string", enum: ["low", "medium", "high", "critical"]},
                    valueScore: {type: ["number", "null"]},
                    relationshipScore: {type: ["number", "null"]},
                    priorityScore: {type: ["number", "null"]},
                    website: {type: "string"},
                    aliases: tagArrayProperty,
                    emailDomains: tagArrayProperty,
                    company: {type: "string", description: "ID de la empresa relacionada."},
                    mainContact: {type: ["string", "null"], description: "ID del contacto principal o null para limpiar."},
                    redmineProjectIds: tagArrayProperty,
                    tags: tagArrayProperty,
                    notes: {type: "string"},
                    archivedAt: nullableDateProperty,
                },
            },
            {
                kind: "company",
                plural: "companies",
                serviceFactory: CompanyServiceFactory,
                requiredCreateFields: ["name"],
                serialize: (entity: any) => this.serializeCompany(entity),
                createProperties: {
                    name: {type: "string"},
                    legalName: {type: "string"},
                    taxIdType: {type: "string"},
                    taxIdNumber: {type: "string"},
                    description: {type: "string"},
                    type: {type: "string", description: "Nombre de CompanyType si el usuario eligio una opcion existente."},
                    status: {type: "string", enum: ["active", "inactive", "archived"]},
                    website: {type: "string"},
                    aliases: tagArrayProperty,
                    emailDomains: tagArrayProperty,
                    tags: tagArrayProperty,
                    notes: {type: "string"},
                },
                updateProperties: {
                    name: {type: "string"},
                    legalName: {type: "string"},
                    taxIdType: {type: "string"},
                    taxIdNumber: {type: "string"},
                    description: {type: "string"},
                    type: {type: "string", description: "Nombre de CompanyType."},
                    status: {type: "string", enum: ["active", "inactive", "archived"]},
                    website: {type: "string"},
                    aliases: tagArrayProperty,
                    emailDomains: tagArrayProperty,
                    tags: tagArrayProperty,
                    notes: {type: "string"},
                    archivedAt: nullableDateProperty,
                },
            },
        ];
    }

    private static createEntityTool(context: ChatbotTaskToolsContext, config: EntityToolConfig): IPromptTool {
        return {
            name: `create_${config.kind}`,
            description: `Crea un ${config.kind} para el usuario autenticado.`,
            parameters: {
                type: "object",
                properties: config.createProperties,
                required: config.requiredCreateFields,
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const entity = await config.serviceFactory.instance.create(this.compactObject({
                    ...args,
                    user: context.userId,
                }));

                return config.serialize(entity);
            },
        };
    }

    private static searchEntitiesTool(context: ChatbotTaskToolsContext, config: EntityToolConfig): IPromptTool {
        return {
            name: `search_${config.plural}`,
            description: `Busca ${config.plural} del usuario por texto. Opcionalmente filtra por status y fecha de creacion.`,
            parameters: {
                type: "object",
                properties: {
                    query: {type: "string", description: "Texto de busqueda."},
                    limit: {type: "number", minimum: 1, maximum: 50, default: 10},
                    status: {type: "string", description: "Status exacto para filtrar."},
                    createdAtFrom: {type: "string", description: "Fecha ISO desde la cual filtrar createdAt inclusive."},
                    createdAtTo: {type: "string", description: "Fecha ISO hasta la cual filtrar createdAt inclusive."},
                },
                required: ["query"],
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const filters: IDraxFieldFilter[] = [this.entityUserFilter(context.userId)];
                const limit = Math.min(Math.max(Number(args.limit ?? 10), 1), 50);

                if (args.status) {
                    filters.push({field: "status", operator: "eq", value: args.status});
                }

                if (args.createdAtFrom) {
                    filters.push({field: "createdAt", operator: "gte", value: args.createdAtFrom});
                }

                if (args.createdAtTo) {
                    filters.push({field: "createdAt", operator: "lte", value: args.createdAtTo});
                }

                const entities = await config.serviceFactory.instance.search(args.query, limit, filters);
                return entities.map((entity: any) => config.serialize(entity));
            },
        };
    }

    private static findEntityByIdTool(context: ChatbotTaskToolsContext, config: EntityToolConfig): IPromptTool {
        return {
            name: `find_${config.kind}_by_id`,
            description: `Busca un ${config.kind} especifico por ID, siempre limitado al usuario autenticado.`,
            parameters: {
                type: "object",
                properties: {
                    id: {type: "string", description: `ID exacto de ${config.kind}.`},
                },
                required: ["id"],
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const entity = await this.findUserEntityById(config, args.id, context.userId);
                return config.serialize(entity);
            },
        };
    }

    private static updateEntityPartialTool(context: ChatbotTaskToolsContext, config: EntityToolConfig): IPromptTool {
        return {
            name: `update_${config.kind}_partial`,
            description: `Actualiza parcialmente un ${config.kind} del usuario autenticado. Usa esta tool para cambiar solo algunos campos particulares de una entidad existente.`,
            parameters: {
                type: "object",
                properties: {
                    id: {type: "string", description: `ID exacto de ${config.kind} a modificar.`},
                    ...config.updateProperties,
                },
                required: ["id"],
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const existingEntity = await this.findUserEntityById(config, args.id, context.userId);

                if (!existingEntity) {
                    return {updated: false, reason: `${config.kind}_not_found`};
                }

                const {_id, id, user, ...input} = args;
                const updateData = this.compactObject(input);
                const updatedEntity = await config.serviceFactory.instance.updatePartial(args.id, updateData);

                return {
                    updated: true,
                    [config.kind]: config.serialize(updatedEntity),
                };
            },
        };
    }

    private static registerTaskTool(context: ChatbotTaskToolsContext): IPromptTool {
        return {
            name: "register_task",
            description: "Registra una tarea para el usuario autenticado cuando el usuario pide crear, guardar o registrar una tarea.",
            parameters: {
                type: "object",
                properties: {
                    title: {type: "string", description: "Titulo breve y accionable de la tarea."},
                    description: {type: "string", description: "Descripcion o contexto adicional."},
                    source: {type: "string", description: "Nombre de Source si el usuario eligio una opcion existente."},
                    type: {type: "string", description: "Nombre de TaskType si el usuario eligio una opcion existente."},
                    lifeArea: {type: "string", description: "Area de vida asociada a la tarea."},
                    status: {type: "string", description: "Nombre de TaskStatus si el usuario eligio una opcion existente."},
                    priority: {type: "string", description: "Nombre de Priority si el usuario eligio una opcion existente."},
                    dueDate: {type: "string", description: "Fecha limite en formato ISO 8601."},
                    scheduledDate: {type: "string", description: "Fecha programada en formato ISO 8601."},
                    valueScore: {type: "number", minimum: 1, maximum: 10},
                    motivationScore: {type: "number", minimum: 1, maximum: 10},
                    effortScore: {type: "number", minimum: 1, maximum: 10},
                    urgencyScore: {type: "number", minimum: 1, maximum: 10},
                    tags: {
                        type: "array",
                        items: {type: "string"},
                    },
                    notes: {type: "string"},
                },
                required: ["title"],
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const taskService = TaskServiceFactory.instance;
                const task = await taskService.create(this.compactObject({
                    title: args.title,
                    description: args.description,
                    source: args.source,
                    type: args.type,
                    lifeArea: args.lifeArea,
                    status: args.status,
                    priority: args.priority,
                    dueDate: args.dueDate,
                    scheduledDate: args.scheduledDate,
                    valueScore: args.valueScore,
                    motivationScore: args.motivationScore,
                    effortScore: args.effortScore,
                    urgencyScore: args.urgencyScore,
                    tags: args.tags ?? [],
                    notes: args.notes,
                    user: context.userId,
                }));

                return this.serializeTask(task);
            },
        };
    }

    private static searchTasksTool(context: ChatbotTaskToolsContext): IPromptTool {
        return {
            name: "search_tasks",
            description: "Busca tareas del usuario por texto usando los campos parametrizados del repositorio, principalmente titulo y descripcion. Opcionalmente filtra por status y fecha de creacion.",
            parameters: {
                type: "object",
                properties: {
                    query: {type: "string", description: "Texto de busqueda para title, description y otros campos configurados."},
                    limit: {type: "number", minimum: 1, maximum: 50, default: 10},
                    status: {type: "string", description: "Nombre exacto de TaskStatus para filtrar."},
                    createdAtFrom: {type: "string", description: "Fecha ISO desde la cual filtrar createdAt inclusive."},
                    createdAtTo: {type: "string", description: "Fecha ISO hasta la cual filtrar createdAt inclusive."},
                },
                required: ["query"],
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const filters: IDraxFieldFilter[] = [this.taskUserFilter(context.userId)];
                const limit = Math.min(Math.max(Number(args.limit ?? 10), 1), 50);

                if (args.status) {
                    filters.push({field: "status", operator: "eq", value: args.status});
                }

                if (args.createdAtFrom) {
                    filters.push({field: "createdAt", operator: "gte", value: args.createdAtFrom});
                }

                if (args.createdAtTo) {
                    filters.push({field: "createdAt", operator: "lte", value: args.createdAtTo});
                }

                const tasks = await TaskServiceFactory.instance.search(args.query, limit, filters);
                return tasks.map(task => this.serializeTask(task));
            },
        };
    }

    private static findTaskByIdTool(context: ChatbotTaskToolsContext): IPromptTool {
        return {
            name: "find_task_by_id",
            description: "Busca una tarea especifica por ID, siempre limitada al usuario autenticado.",
            parameters: {
                type: "object",
                properties: {
                    id: {type: "string", description: "ID exacto de la tarea."},
                },
                required: ["id"],
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const task = await this.findUserTaskById(args.id, context.userId);
                return this.serializeTask(task);
            },
        };
    }

    private static groupTasksTool(context: ChatbotTaskToolsContext): IPromptTool {
        return {
            name: "group_tasks",
            description: "Cuenta tareas agrupadas por atributos de Task. Tambien suma campos numericos cuando se incluyen en fields. Usa esta tool para responder metricas como tareas por status, prioridad, fecha, proyecto, cliente o totales de minutos.",
            parameters: {
                type: "object",
                properties: {
                    fields: {
                        type: "array",
                        items: {type: "string", enum: TASK_GROUP_BY_FIELDS},
                        minItems: 1,
                        maxItems: 10,
                        description: "Campos por los que agrupar o sumar. Los campos numericos se suman; los demas agrupan.",
                    },
                    filters: {
                        type: "array",
                        description: "Filtros AND opcionales compatibles con Drax. No incluyas user; la tool lo agrega automaticamente.",
                        items: {
                            type: "object",
                            properties: {
                                field: {type: "string", enum: TASK_GROUP_BY_FIELDS},
                                operator: {
                                    type: "string",
                                    enum: ["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin", "like", "empty"],
                                },
                                value: {
                                    type: ["string", "number", "boolean", "array", "null"],
                                    items: {type: ["string", "number", "boolean"]},
                                    description: "Valor del filtro. Para fechas usa ISO 8601; para in/nin puede ser array.",
                                },
                            },
                            required: ["field", "operator"],
                            additionalProperties: false,
                        },
                    },
                    dateFormat: {
                        type: "string",
                        enum: TASK_GROUP_BY_DATE_FORMATS,
                        default: "day",
                        description: "Granularidad para campos fecha.",
                    },
                },
                required: ["fields"],
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const filters: IDraxFieldFilter[] = [
                    ...(Array.isArray(args.filters) ? args.filters : []),
                    this.taskUserFilter(context.userId),
                ];

                return await TaskServiceFactory.instance.groupBy({
                    fields: args.fields,
                    filters,
                    dateFormat: args.dateFormat ?? "day",
                });
            },
        };
    }

    private static updateTaskPartialTool(context: ChatbotTaskToolsContext): IPromptTool {
        return {
            name: "update_task_partial",
            description: "Actualiza parcialmente una tarea del usuario autenticado. Usa esta tool para cambiar solo algunos campos particulares de una tarea existente.",
            parameters: {
                type: "object",
                properties: {
                    id: {type: "string", description: "ID exacto de la tarea a modificar."},
                    title: {type: "string"},
                    description: {type: "string"},
                    source: {type: "string", description: "Nombre de Source."},
                    type: {type: "string", description: "Nombre de TaskType."},
                    lifeArea: {type: ["string", "null"], description: "Area de vida o null para limpiar."},
                    status: {type: "string", description: "Nombre de TaskStatus."},
                    priority: {type: "string", description: "Nombre de Priority."},
                    dueDate: {type: ["string", "null"], description: "Fecha limite ISO o null para limpiar."},
                    scheduledDate: {type: ["string", "null"], description: "Fecha programada ISO o null para limpiar."},
                    completedAt: {type: ["string", "null"], description: "Fecha de completado ISO o null para limpiar."},
                    valueScore: {type: "number", minimum: 1, maximum: 10},
                    motivationScore: {type: "number", minimum: 1, maximum: 10},
                    effortScore: {type: "number", minimum: 1, maximum: 10},
                    urgencyScore: {type: "number", minimum: 1, maximum: 10},
                    tags: {type: "array", items: {type: "string"}},
                    notes: {type: "string"},
                    archivedAt: {type: ["string", "null"], description: "Fecha ISO o null para limpiar."},
                },
                required: ["id"],
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const existingTask = await this.findUserTaskById(args.id, context.userId);

                if (!existingTask) {
                    return {updated: false, reason: "task_not_found"};
                }

                const {_id, id, user, ...input} = args;
                const updateData = this.compactObject(input);
                const updatedTask = await TaskServiceFactory.instance.updatePartial(args.id, updateData);

                return {
                    updated: true,
                    task: this.serializeTask(updatedTask),
                };
            },
        };
    }

    private static listTaskOptionsTool(): IPromptTool {
        return {
            name: "list_task_options",
            description: "Consulta de una sola vez todas las opciones disponibles de Source, TaskStatus, TaskType y Priority.",
            parameters: {
                type: "object",
                properties: {},
                additionalProperties: false,
            },
            execute: async () => {
                return await this.fetchTaskOptionNames();
            },
        };
    }

    private static createTaskOptionTool(kind: TaskOptionKind): IPromptTool {
        const serviceMap = {
            source: SourceServiceFactory.instance,
            status: TaskStatusServiceFactory.instance,
            type: TaskTypeServiceFactory.instance,
            priority: PriorityServiceFactory.instance,
        };
        const entityLabelMap = {
            source: "Source",
            status: "TaskStatus",
            type: "TaskType",
            priority: "Priority",
        };
        const toolNameMap = {
            source: "create_source",
            status: "create_task_status",
            type: "create_task_type",
            priority: "create_priority",
        };
        const properties: Record<string, any> = {
            name: {type: "string", description: "Nombre de la nueva opcion."},
            description: {type: "string", description: "Descripcion opcional."},
        };
        const required = ["name"];

        if (kind === "priority") {
            properties.color = {type: "string", description: "Color de la prioridad."};
            required.push("color");
        }

        return {
            name: toolNameMap[kind],
            description: `Crea una nueva opcion de ${entityLabelMap[kind]} cuando el usuario necesita una opcion que no existe.`,
            parameters: {
                type: "object",
                properties,
                required,
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const createData = this.compactObject({
                    name: args.name,
                    description: args.description,
                    color: kind === "priority" ? args.color : undefined,
                });

                return await serviceMap[kind].create(createData as any);
            },
        };
    }
}

export type {ChatbotTaskToolsContext, TaskOptionNames, EntityTypeOptionNames, LifeOpsOptionNames};
export default ChatbotTaskTools;
export {ChatbotTaskTools};
