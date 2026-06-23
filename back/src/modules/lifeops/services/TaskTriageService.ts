import {AiProviderFactory} from "@drax/ai-back";
import type {IPromptResponse} from "@drax/ai-back";
import {z} from "zod";
import type {ITask} from "../interfaces/ITask";
import TaskServiceFactory from "../factory/services/TaskServiceFactory.js";
import SourceServiceFactory from "../factory/services/SourceServiceFactory.js";
import TaskTypeServiceFactory from "../factory/services/TaskTypeServiceFactory.js";
import LifeAreaServiceFactory from "../factory/services/LifeAreaServiceFactory.js";
import TaskStatusServiceFactory from "../factory/services/TaskStatusServiceFactory.js";
import PriorityServiceFactory from "../factory/services/PriorityServiceFactory.js";
import GoalServiceFactory from "../factory/services/GoalServiceFactory.js";
import ProjectServiceFactory from "../factory/services/ProjectServiceFactory.js";

const scoreSchema = z.number().int().min(1).max(10).nullable().optional();

const TaskTriageSchema = z.object({
    source: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    lifeArea: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    priority: z.string().nullable().optional(),
    goals: z.array(z.string()).nullable().optional(),
    project: z.string().nullable().optional(),
    valueScore: scoreSchema,
    motivationScore: scoreSchema,
    effortScore: scoreSchema,
    urgencyScore: scoreSchema
});

type TaskTriageOutput = z.infer<typeof TaskTriageSchema>;

interface TaskTriageRequestContext {
    ip?: string;
    userAgent?: string;
    tenant?: string | null;
    user?: string | null;
}

interface NamedOption {
    _id: string;
    name: string;
    description?: string;
}

interface TaskTriageOptions {
    sources: NamedOption[];
    types: NamedOption[];
    lifeAreas: NamedOption[];
    statuses: NamedOption[];
    priorities: NamedOption[];
    goals: NamedOption[];
    projects: NamedOption[];
}

interface TaskTriageResult {
    task: ITask;
    patch: Partial<TaskTriageOutput>;
    usage: Pick<IPromptResponse, "tokens" | "inputTokens" | "outputTokens" | "time">;
}

class TaskTriageService {
    async triageTask(taskId: string, context: TaskTriageRequestContext = {}): Promise<TaskTriageResult> {
        const task = await TaskServiceFactory.instance.findById(taskId);

        if (!task) {
            throw new Error("task.not_found");
        }

        const options = await this.fetchOptions(task);
        const response = await AiProviderFactory.instance(process.env.AI_PROVIDER || "OpenAi").prompt({
            systemPrompt: this.buildSystemPrompt(options),
            userInput: JSON.stringify(this.serializeTask(task), null, 2),
            zodSchema: TaskTriageSchema,
            operationTitle: "task-triage",
            operationGroup: "lifeops",
            ip: context.ip,
            userAgent: context.userAgent,
            tenant: context.tenant,
            user: context.user
        });

        const suggestion = TaskTriageSchema.parse(this.parsePromptOutput(response.output));
        const patch = this.buildPatch(task, suggestion, options);
        const updatedTask = Object.keys(patch).length > 0
            ? await TaskServiceFactory.instance.updatePartial(taskId, patch as any)
            : task;

        return {
            task: updatedTask,
            patch,
            usage: {
                tokens: response.tokens,
                inputTokens: response.inputTokens,
                outputTokens: response.outputTokens,
                time: response.time
            }
        };
    }

    private async fetchOptions(task: ITask): Promise<TaskTriageOptions> {
        const userId = this.resolveId(task.user);
        const [sources, types, lifeAreas, statuses, priorities, goals, projects] = await Promise.all([
            SourceServiceFactory.instance.fetchAll(),
            TaskTypeServiceFactory.instance.fetchAll(),
            LifeAreaServiceFactory.instance.fetchAll(),
            TaskStatusServiceFactory.instance.fetchAll(),
            PriorityServiceFactory.instance.fetchAll(),
            userId ? GoalServiceFactory.instance.find({
                limit: 1000,
                orderBy: "name",
                order: "asc",
                filters: [{field: "user", operator: "eq", value: userId}]
            }) : Promise.resolve([]),
            userId ? ProjectServiceFactory.instance.find({
                limit: 1000,
                orderBy: "name",
                order: "asc",
                filters: [{field: "user", operator: "eq", value: userId}]
            }) : Promise.resolve([])
        ]);

        return {
            sources: this.serializeOptions(sources),
            types: this.serializeOptions(types),
            lifeAreas: this.serializeOptions(lifeAreas),
            statuses: this.serializeOptions(statuses),
            priorities: this.serializeOptions(priorities),
            goals: this.serializeOptions(goals),
            projects: this.serializeOptions(projects)
        };
    }

    private buildSystemPrompt(options: TaskTriageOptions): string {
        return [
            "Sos un clasificador de tareas de LifeOps.",
            "Analiza la tarea recibida y devuelve exclusivamente JSON que cumpla el schema.",
            "Usa los campos existentes de la tarea como evidencia. Si un valor ya existe y es razonable, preservalo.",
            "No inventes valores fuera de las opciones disponibles.",
            "Para source, type, lifeArea, status y priority devuelve el campo name exacto.",
            "Para goals devuelve un array de _id. Para project devuelve un _id.",
            "Para scores usa enteros de 1 a 10: valueScore=impacto, motivationScore=ganas, effortScore=esfuerzo, urgencyScore=urgencia.",
            "Si no hay evidencia suficiente para un campo, devuelve null o omitilo.",
            "",
            "[OPCIONES]",
            `source: ${this.formatNameOptions(options.sources)}`,
            `type: ${this.formatNameOptions(options.types)}`,
            `lifeArea: ${this.formatNameOptions(options.lifeAreas)}`,
            `status: ${this.formatNameOptions(options.statuses)}`,
            `priority: ${this.formatNameOptions(options.priorities)}`,
            `goals: ${this.formatIdOptions(options.goals)}`,
            `project: ${this.formatIdOptions(options.projects)}`
        ].join("\n");
    }

    private serializeTask(task: ITask): Partial<ITask> {
        return {
            _id: task._id,
            title: task.title,
            description: task.description,
            source: task.source,
            type: task.type,
            lifeArea: task.lifeArea,
            status: task.status,
            priority: task.priority,
            goals: this.serializeSelectedRefs(task.goals),
            project: this.serializeSelectedRef(task.project),
            valueScore: task.valueScore,
            motivationScore: task.motivationScore,
            effortScore: task.effortScore,
            urgencyScore: task.urgencyScore,
            dueDate: task.dueDate,
            scheduledDate: task.scheduledDate,
            tags: task.tags,
            notes: task.notes,
            redmineIssueId: task.redmineIssueId,
            emailMessageId: task.emailMessageId,
            calendarEventId: task.calendarEventId
        };
    }

    private buildPatch(task: ITask, suggestion: TaskTriageOutput, options: TaskTriageOptions): Partial<TaskTriageOutput> {
        const patch: Partial<TaskTriageOutput> = {};

        this.applyNamePatch(patch, task, suggestion, options.sources, "source");
        this.applyNamePatch(patch, task, suggestion, options.types, "type");
        this.applyNamePatch(patch, task, suggestion, options.lifeAreas, "lifeArea");
        this.applyNamePatch(patch, task, suggestion, options.statuses, "status");
        this.applyNamePatch(patch, task, suggestion, options.priorities, "priority");
        this.applyIdPatch(patch, task, suggestion, options.projects, "project");
        this.applyIdsPatch(patch, task, suggestion, options.goals, "goals");
        this.applyScorePatch(patch, task, suggestion, "valueScore");
        this.applyScorePatch(patch, task, suggestion, "motivationScore");
        this.applyScorePatch(patch, task, suggestion, "effortScore");
        this.applyScorePatch(patch, task, suggestion, "urgencyScore");

        return patch;
    }

    private parsePromptOutput(output: unknown): unknown {
        if (typeof output !== "string") {
            return output;
        }

        const text = output.trim();
        const jsonText = this.stripJsonFence(text);

        try {
            return JSON.parse(jsonText);
        } catch (e) {
            const objectText = this.extractJsonObject(jsonText);
            if (!objectText) {
                throw e;
            }

            return JSON.parse(objectText);
        }
    }

    private stripJsonFence(text: string): string {
        return text
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
    }

    private extractJsonObject(text: string): string | null {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");

        if (start === -1 || end === -1 || end <= start) {
            return null;
        }

        return text.slice(start, end + 1);
    }

    private applyNamePatch(
        patch: Partial<TaskTriageOutput>,
        task: ITask,
        suggestion: TaskTriageOutput,
        options: NamedOption[],
        field: "source" | "type" | "lifeArea" | "status" | "priority"
    ): void {
        const value = this.normalizeString(suggestion[field]);

        if (!value || !options.some(option => option.name === value) || task[field] === value) {
            return;
        }

        patch[field] = value;
    }

    private applyIdPatch(
        patch: Partial<TaskTriageOutput>,
        task: ITask,
        suggestion: TaskTriageOutput,
        options: NamedOption[],
        field: "project"
    ): void {
        const value = this.normalizeString(suggestion[field]);
        const currentValue = this.resolveId(task[field]);

        if (!value || !options.some(option => option._id === value) || currentValue === value) {
            return;
        }

        patch[field] = value;
    }

    private applyIdsPatch(
        patch: Partial<TaskTriageOutput>,
        task: ITask,
        suggestion: TaskTriageOutput,
        options: NamedOption[],
        field: "goals"
    ): void {
        const allowedIds = new Set(options.map(option => option._id));
        const values = Array.isArray(suggestion[field])
            ? Array.from(new Set(suggestion[field].map(value => this.normalizeString(value)).filter((value): value is string => Boolean(value))))
            : [];
        const validValues = values.filter(value => allowedIds.has(value));
        const currentValues = Array.isArray(task[field])
            ? task[field].map(value => this.resolveId(value)).filter((value): value is string => Boolean(value))
            : [];

        if (validValues.length === 0 || this.sameStringSet(validValues, currentValues)) {
            return;
        }

        patch[field] = validValues;
    }

    private applyScorePatch(
        patch: Partial<TaskTriageOutput>,
        task: ITask,
        suggestion: TaskTriageOutput,
        field: "valueScore" | "motivationScore" | "effortScore" | "urgencyScore"
    ): void {
        const value = suggestion[field];

        if (typeof value !== "number" || task[field] === value) {
            return;
        }

        patch[field] = value;
    }

    private serializeOptions(options: any[]): NamedOption[] {
        return options
            .filter(option => option?._id && option?.name)
            .map(option => ({
                _id: String(option._id),
                name: String(option.name),
                description: option.description ? String(option.description) : undefined
            }));
    }

    private serializeSelectedRefs(values: any[] | undefined): Array<{_id: string; name?: string}> {
        return Array.isArray(values)
            ? values.map(value => this.serializeSelectedRef(value)).filter((value): value is {_id: string; name?: string} => Boolean(value))
            : [];
    }

    private serializeSelectedRef(value: any): {_id: string; name?: string} | undefined {
        const id = this.resolveId(value);

        if (!id) {
            return undefined;
        }

        return {
            _id: id,
            name: value?.name
        };
    }

    private resolveId(value: any): string | undefined {
        if (!value) {
            return undefined;
        }

        if (typeof value === "string") {
            return value;
        }

        return value._id ? String(value._id) : undefined;
    }

    private normalizeString(value: unknown): string | undefined {
        return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
    }

    private sameStringSet(a: string[], b: string[]): boolean {
        return a.length === b.length && a.every(value => b.includes(value));
    }

    private formatNameOptions(options: NamedOption[]): string {
        return options.length > 0
            ? options.map(option => this.formatOption(option, false)).join("; ")
            : "sin opciones configuradas";
    }

    private formatIdOptions(options: NamedOption[]): string {
        return options.length > 0
            ? options.map(option => this.formatOption(option, true)).join("; ")
            : "sin opciones configuradas";
    }

    private formatOption(option: NamedOption, includeId: boolean): string {
        const description = option.description ? ` (${option.description})` : "";
        return includeId ? `${option._id}: ${option.name}${description}` : `${option.name}${description}`;
    }
}

export default TaskTriageService;
export {TaskTriageService};
export type {TaskTriageResult};
