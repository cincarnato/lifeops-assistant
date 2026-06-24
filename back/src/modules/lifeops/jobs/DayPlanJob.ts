
import {AiProviderFactory} from "@drax/ai-back";
import type {IPromptResponse} from "@drax/ai-back";
import type {IDraxFieldFilter} from "@drax/crud-share";
import type {IUser} from "@drax/identity-share";
import {UserServiceFactory} from "@drax/identity-back";
import {z} from "zod";
import GoogleCalendarServiceFactory from "../../google/factory/GoogleCalendarServiceFactory.js";
import type {GoogleCalendarEvent} from "../../google/interfaces/IGoogleCalendar.js";
import DayPlanServiceFactory from "../factory/services/DayPlanServiceFactory.js";
import GoalServiceFactory from "../factory/services/GoalServiceFactory.js";
import HabitServiceFactory from "../factory/services/HabitServiceFactory.js";
import ProjectServiceFactory from "../factory/services/ProjectServiceFactory.js";
import TaskServiceFactory from "../factory/services/TaskServiceFactory.js";
import type {IDayPlan, IDayPlanBase} from "../interfaces/IDayPlan.js";
import type {IGoal} from "../interfaces/IGoal.js";
import type {IHabit} from "../interfaces/IHabit.js";
import type {IProject} from "../interfaces/IProject.js";
import type {ITask} from "../interfaces/ITask.js";

const DecisionSchema = z.enum(["PENDIENTE", "COMPROMETIDO", "DESEABLE", "DESCARTADO"]);

const SuggestionSchema = z.object({
    title: z.string().min(1),
    goal: z.string().nullable().optional(),
    project: z.string().nullable().optional(),
});

const SuggestionsSchema = z.object({
    suggestions: z.array(SuggestionSchema).min(0).max(8).default([]),
});

interface DayPlanGenerateForUserOptions {
    userId: string;
    date?: Date;
    ip?: string;
    userAgent?: string;
    tenant?: string | null;
}

interface DayPlanGenerateForAllUsersOptions {
    date?: Date;
    limit?: number;
}

interface DayPlanGenerateForAllUsersResult {
    userId: string;
    dayPlan?: IDayPlan;
    error?: string;
}

type SuggestionOutput = z.infer<typeof SuggestionSchema>;

class DayPlanJob {
    async generateForUser(options: DayPlanGenerateForUserOptions): Promise<IDayPlan> {
        const date = this.startOfDay(options.date ?? new Date());
        const userId = options.userId;

        const [events, tasks, habits, goals, projects] = await Promise.all([
            this.fetchCalendarEvents(userId, date),
            this.fetchCandidateTasks(userId),
            this.fetchDueHabits(userId, date),
            this.fetchGoals(userId),
            this.fetchProjects(userId),
        ]);

        const suggestions = await this.generateSuggestions({
            userId,
            date,
            goals,
            projects,
            tasks,
            habits,
            ip: options.ip,
            userAgent: options.userAgent,
            tenant: options.tenant,
        });

        const payload: IDayPlanBase = {
            date,
            user: userId,
            status: "BORRADOR",
            events: events.map(event => ({
                googleEventId: event.id,
                title: event.summary,
                description: event.description,
                startAt: this.resolveGoogleEventDate(event.start, date),
                endAt: event.end ? this.resolveGoogleEventDate(event.end, date) : undefined,
                decision: "PENDIENTE",
            })),
            tasks: tasks.map(task => ({
                task: this.stringifyId(task),
                decision: "PENDIENTE",
            })),
            habits: habits.map(habit => ({
                habit: this.stringifyId(habit),
                decision: "PENDIENTE",
            })),
            suggestions: suggestions.map(suggestion => ({
                title: suggestion.title,
                decision: DecisionSchema.enum.PENDIENTE,
                goal: suggestion.goal ?? undefined,
                project: suggestion.project ?? undefined,
            })),
        };

        const existing = await this.findExistingPlan(userId, date);

        if (existing) {
            return await DayPlanServiceFactory.instance.updatePartial(this.stringifyId(existing), payload as any);
        }

        return await DayPlanServiceFactory.instance.create(payload);
    }

    async generateForAllUsers(options: DayPlanGenerateForAllUsersOptions = {}): Promise<DayPlanGenerateForAllUsersResult[]> {
        const users = await UserServiceFactory().find({
            limit: options.limit ?? 10000,
            orderBy: "username",
            order: "asc",
            filters: [{field: "active", operator: "eq", value: true}],
        }) as IUser[];

        const results: DayPlanGenerateForAllUsersResult[] = [];

        for (const user of users) {
            const userId = this.stringifyId(user);

            try {
                const dayPlan = await this.generateForUser({
                    userId,
                    date: options.date,
                });
                results.push({userId, dayPlan});
            } catch (error) {
                console.error("[day-plan-job] failed for user", {
                    userId,
                    name: (error as any)?.name,
                    message: (error as any)?.message,
                    stack: (error as any)?.stack,
                });
                results.push({userId, error: this.resolveErrorMessage(error)});
            }
        }

        return results;
    }

    private async findExistingPlan(userId: string, date: Date): Promise<IDayPlan | null> {
        const plans = await DayPlanServiceFactory.instance.find({
            limit: 1,
            filters: this.buildDayFilters(userId, date),
        });

        return plans[0] ?? null;
    }

    private async fetchCalendarEvents(userId: string, date: Date): Promise<GoogleCalendarEvent[]> {
        try {
            const result = await GoogleCalendarServiceFactory.instance.listEvents({
                userId,
                calendarId: "primary",
                timeMin: date.toISOString(),
                timeMax: this.endOfDay(date).toISOString(),
                limit: 50,
            });

            return result.items.filter(event => event.status !== "cancelled");
        } catch (error) {
            console.warn("[day-plan-job] google calendar unavailable", {
                userId,
                date: date.toISOString(),
                message: (error as any)?.message,
            });

            return [];
        }
    }

    private async fetchCandidateTasks(userId: string): Promise<ITask[]> {
        const tasks = await TaskServiceFactory.instance.find({
            limit: 200,
            filters: [{field: "user", operator: "eq", value: userId}],
        });

        const pendingTasks = tasks.filter(task => this.isPendingTask(task));
        const sortedTasks = pendingTasks.sort((a, b) => this.scoreTask(b) - this.scoreTask(a));
        const targetCount = Math.min(5, Math.max(3, sortedTasks.length));

        return sortedTasks.slice(0, targetCount);
    }

    private async fetchDueHabits(userId: string, date: Date): Promise<IHabit[]> {
        const habits = await HabitServiceFactory.instance.find({
            limit: 500,
            orderBy: "name",
            order: "asc",
            filters: [
                {field: "user", operator: "eq", value: userId},
                {field: "active", operator: "eq", value: true},
            ],
        });

        return habits.filter(habit => this.isHabitDue(habit, date));
    }

    private async fetchGoals(userId: string): Promise<IGoal[]> {
        const goals = await GoalServiceFactory.instance.find({
            limit: 100,
            orderBy: "name",
            order: "asc",
            filters: [{field: "user", operator: "eq", value: userId}],
        });

        return goals.filter(goal => !goal.completedAt && !goal.archivedAt);
    }

    private async fetchProjects(userId: string): Promise<IProject[]> {
        const projects = await ProjectServiceFactory.instance.find({
            limit: 100,
            orderBy: "name",
            order: "asc",
            filters: [{field: "user", operator: "eq", value: userId}],
        });

        return projects.filter(project => !project.completedAt && !project.archivedAt);
    }

    private async generateSuggestions(context: {
        userId: string;
        date: Date;
        goals: IGoal[];
        projects: IProject[];
        tasks: ITask[];
        habits: IHabit[];
        ip?: string;
        userAgent?: string;
        tenant?: string | null;
    }): Promise<SuggestionOutput[]> {
        if (context.goals.length === 0 && context.projects.length === 0) {
            return [];
        }

        try {
            const response = await AiProviderFactory.instance().prompt({
                systemPrompt: this.buildSuggestionsSystemPrompt(context.goals, context.projects),
                userInput: JSON.stringify({
                    date: this.formatDate(context.date),
                    selectedTasks: context.tasks.map(task => ({
                        id: this.stringifyId(task),
                        title: task.title,
                        priority: task.priority,
                        valueScore: task.valueScore,
                    })),
                    selectedHabits: context.habits.map(habit => ({
                        id: this.stringifyId(habit),
                        name: habit.name,
                        frequency: habit.frequency?.type,
                    })),
                }, null, 2),
                zodSchema: SuggestionsSchema,
                operationTitle: "day-plan-suggestions",
                operationGroup: "lifeops",
                ip: context.ip,
                userAgent: context.userAgent,
                tenant: context.tenant,
                user: context.userId,
            });

            return this.normalizeSuggestions(response, context.goals, context.projects);
        } catch (error) {
            console.error("[day-plan-job] AI suggestions failed", {
                userId: context.userId,
                date: context.date.toISOString(),
                name: (error as any)?.name,
                message: (error as any)?.message,
            });

            return [];
        }
    }

    private normalizeSuggestions(response: IPromptResponse, goals: IGoal[], projects: IProject[]): SuggestionOutput[] {
        const parsed = SuggestionsSchema.parse(this.parsePromptOutput(response.output));
        const goalIds = new Set(goals.map(goal => this.stringifyId(goal)));
        const projectIds = new Set(projects.map(project => this.stringifyId(project)));

        return parsed.suggestions
            .map(suggestion => ({
                title: suggestion.title.trim(),
                goal: suggestion.goal && goalIds.has(suggestion.goal) ? suggestion.goal : null,
                project: suggestion.project && projectIds.has(suggestion.project) ? suggestion.project : null,
            }))
            .filter(suggestion => suggestion.title.length > 0)
            .slice(0, 5);
    }

    private buildSuggestionsSystemPrompt(goals: IGoal[], projects: IProject[]): string {
        return [
            "Sos un planificador diario de LifeOps.",
            "Genera sugerencias concretas para el dia, alineadas a objetivos y proyectos activos del usuario.",
            "Devuelve exclusivamente JSON que cumpla el schema: { suggestions: [{ title, goal, project }] }.",
            "Escribi todas las sugerencias en español.",
            "El title debe estar en español y ser una accion breve, concreta y ejecutable en el dia.",
            "Usa goal y project solo con ids existentes. Si no corresponde, usa null.",
            "No repitas tareas o habitos ya seleccionados en el input.",
            "Genera entre 3 y 5 sugerencias si hay contexto suficiente.",
            "",
            "[OBJETIVOS]",
            JSON.stringify(goals.map(goal => ({
                id: this.stringifyId(goal),
                name: goal.name,
                description: goal.description,
                priority: goal.priority,
                valueScore: goal.valueScore,
                progressPercent: goal.progressPercent,
            })), null, 2),
            "",
            "[PROYECTOS]",
            JSON.stringify(projects.map(project => ({
                id: this.stringifyId(project),
                name: project.name,
                description: project.description,
                priority: project.priority,
                valueScore: project.valueScore,
                priorityScore: project.priorityScore,
                progressPercent: project.progressPercent,
                goals: this.stringifyIds(project.goals),
            })), null, 2),
        ].join("\n");
    }

    private isPendingTask(task: ITask): boolean {
        if (task.completedAt || task.archivedAt) {
            return false;
        }

        const status = String(task.status ?? "").toLocaleLowerCase("es");
        return !["done", "hecho", "complet", "cerrad", "archiv"].some(value => status.includes(value));
    }

    private scoreTask(task: ITask): number {
        const priorityScore = this.priorityScore(task.priority);
        const valueScore = Number(task.valueScore ?? 0);
        const urgencyScore = Number(task.urgencyScore ?? 0);
        const dueDateScore = task.dueDate ? Math.max(0, 10 - Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86_400_000)) : 0;

        return priorityScore * 4 + valueScore * 3 + urgencyScore * 2 + dueDateScore;
    }

    private priorityScore(priority?: string): number {
        const value = String(priority ?? "").toLocaleLowerCase("es");

        if (["alta", "high", "urgent", "urgente", "critica", "crítica"].some(token => value.includes(token))) {
            return 10;
        }

        if (["media", "medium"].some(token => value.includes(token))) {
            return 6;
        }

        if (["baja", "low"].some(token => value.includes(token))) {
            return 2;
        }

        return 4;
    }

    private isHabitDue(habit: IHabit, date: Date): boolean {
        const type = habit.frequency?.type ?? "daily";
        const createdAt = habit.createdAt ? new Date(habit.createdAt) : null;

        if (!createdAt || type === "daily") {
            return true;
        }

        if (type === "weekly") {
            return createdAt.getDay() === date.getDay();
        }

        if (type === "monthly") {
            return createdAt.getDate() === date.getDate();
        }

        return true;
    }

    private buildDayFilters(userId: string, date: Date): IDraxFieldFilter[] {
        return [
            {field: "user", operator: "eq", value: userId},
            {field: "date", operator: "gte", value: this.startOfDay(date)},
            {field: "date", operator: "lte", value: this.endOfDay(date)},
        ];
    }

    private resolveGoogleEventDate(value: {date?: string; dateTime?: string; timeZone?: string}, fallbackDate: Date): Date {
        if (value?.dateTime) {
            return new Date(value.dateTime);
        }

        if (value?.date) {
            return new Date(`${value.date}T00:00:00`);
        }

        return fallbackDate;
    }

    private parsePromptOutput(output: unknown): unknown {
        if (typeof output !== "string") {
            return output;
        }

        const text = output.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();

        try {
            return JSON.parse(text);
        } catch (error) {
            const start = text.indexOf("{");
            const end = text.lastIndexOf("}");

            if (start >= 0 && end > start) {
                return JSON.parse(text.slice(start, end + 1));
            }

            throw error;
        }
    }

    private startOfDay(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    }

    private endOfDay(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    }

    private formatDate(date: Date): string {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
        ].join("-");
    }

    private stringifyIds(values?: any[]): string[] {
        return Array.isArray(values) ? values.map(value => this.stringifyId(value)).filter(Boolean) : [];
    }

    private stringifyId(value: any): string {
        if (typeof value === "string") {
            return value;
        }

        return value?._id?.toString?.() ?? value?.id?.toString?.() ?? value?.toString?.() ?? "";
    }

    private resolveErrorMessage(error: unknown): string {
        return (error as any)?.message ?? "dayplan.generation.failed";
    }

}


export default DayPlanJob
export {DayPlanJob}
export type {
    DayPlanGenerateForUserOptions,
    DayPlanGenerateForAllUsersOptions,
    DayPlanGenerateForAllUsersResult,
}
