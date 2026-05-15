import {randomUUID} from "node:crypto";
import {AiProviderFactory} from "@drax/ai-back";
import ChatbotTaskTools from "../tools/ChatbotTaskTools.js";
import type {IPromptTool} from "@drax/ai-back/types/interfaces/IAIProvider.js";
import type {EntityTypeOptionNames, LifeOpsOptionNames, TaskOptionNames} from "../tools/ChatbotTaskTools.js";

type ChatRole = "user" | "assistant" | "system";

interface ChatMessage {
    role: ChatRole;
    content: string;
}

interface ChatbotTaskMessageInput {
    sessionId?: string;
    message: string;
    userId: string;
    tenantId?: string | null;
    ip?: string;
    userAgent?: string;
}

interface ChatbotTaskMessageOutput {
    sessionId: string;
    message: string;
}

interface ChatbotTaskSession {
    id: string;
    userId: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

class ChatbotTaskService {
    private sessions: Map<string, ChatbotTaskSession> = new Map();

    startSession(userId: string): ChatbotTaskSession {
        return this.createSession(userId);
    }

    private createSession(userId: string, sessionId: string = randomUUID()): ChatbotTaskSession {
        const session: ChatbotTaskSession = {
            id: sessionId,
            userId,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.sessions.set(this.getSessionKey(userId, session.id), session);
        return session;
    }

    async sendMessage(input: ChatbotTaskMessageInput): Promise<ChatbotTaskMessageOutput> {
        const session = this.resolveSession(input.userId, input.sessionId);
        const provider = AiProviderFactory.instance();
        const history = session.messages.slice(-20);
        const optionNames = await ChatbotTaskTools.fetchLifeOpsOptionNames();
        const tools = this.withToolExecutionLogs(
            ChatbotTaskTools.build({userId: input.userId}),
            session.id
        );

        const response = await provider.prompt({
            systemPrompt: this.systemPrompt(optionNames),
            userInput: input.message,
            history,
            tools,
            toolMaxIterations: 10,
            operationTitle: "lifeops-task-chatbot",
            operationGroup: "lifeops",
            ip: input.ip,
            userAgent: input.userAgent,
            tenant: input.tenantId ?? null,
            user: input.userId,
        });

        const assistantMessage = this.normalizeOutput(response.output);
        session.messages.push({role: "user", content: input.message});
        session.messages.push({role: "assistant", content: assistantMessage});
        session.updatedAt = new Date();

        return {
            sessionId: session.id,
            message: assistantMessage,
        };
    }

    private resolveSession(userId: string, sessionId?: string): ChatbotTaskSession {
        if (!sessionId) {
            return this.startSession(userId);
        }

        const existingSession = this.sessions.get(this.getSessionKey(userId, sessionId));
        if (existingSession) {
            return existingSession;
        }

        return this.createSession(userId, sessionId);
    }

    private getSessionKey(userId: string, sessionId: string): string {
        return `${userId}:${sessionId}`;
    }

    private normalizeOutput(output: any): string {
        if (typeof output === "string") {
            return output;
        }

        if (output?.message && typeof output.message === "string") {
            return output.message;
        }

        return JSON.stringify(output);
    }

    private withToolExecutionLogs(tools: IPromptTool[], sessionId: string): IPromptTool[] {
        return tools.map(tool => ({
            ...tool,
            execute: async (args: any) => {
                console.log("[lifeops-task-chatbot] tool:start", {
                    sessionId,
                    tool: tool.name,
                    args,
                });

                try {
                    const result = await tool.execute(args);

                    console.log("[lifeops-task-chatbot] tool:success", {
                        sessionId,
                        tool: tool.name,
                    });

                    return result;
                } catch (error) {
                    console.error("[lifeops-task-chatbot] tool:error", {
                        sessionId,
                        tool: tool.name,
                        error,
                    });

                    throw error;
                }
            },
        }));
    }

    private systemPrompt(optionNames: LifeOpsOptionNames): string {
        return [
            "Sos un asistente de LifeOps especializado en gestionar tareas, objetivos, proyectos, contactos, clientes y empresas.",
            "Conversas en espanol claro y breve.",
            "Cuando el usuario pida registrar, crear, guardar o agendar una tarea, usa la tool register_task.",
            "Cuando el usuario pida buscar tareas por texto, usa search_tasks. Si pide una tarea puntual por ID, usa find_task_by_id.",
            "Cuando el usuario pida cantidad de tareas agrupadas, metricas, distribuciones o totales por atributos como status, priority, source, type, fechas, proyecto, cliente o minutos, usa group_tasks.",
            "Cuando el usuario pida modificar una tarea existente, primero identifica el ID y usa update_task_partial.",
            "Cuando el usuario pida crear objetivos, proyectos, contactos, clientes o empresas, usa create_goal, create_project, create_contact, create_client o create_company.",
            "Cuando el usuario pida buscar objetivos, proyectos, contactos, clientes o empresas por texto, usa search_goals, search_projects, search_contacts, search_clients o search_companies. Si pide una entidad puntual por ID, usa find_goal_by_id, find_project_by_id, find_contact_by_id, find_client_by_id o find_company_by_id.",
            "Cuando el usuario pida modificar parcialmente objetivos, proyectos, contactos, clientes o empresas existentes, primero identifica el ID y usa update_goal_partial, update_project_partial, update_contact_partial, update_client_partial o update_company_partial.",
            "Para registrar o modificar tareas, elegi source, status, type y priority solo desde estas opciones disponibles por nombre:",
            this.formatTaskOptionNames(optionNames.task),
            "No llames list_task_options antes de registrar o modificar una tarea cuando puedas elegir una opcion desde la lista anterior.",
            "Si el usuario pide una opcion de source, status, type o priority que no existe, podes crearla con create_source, create_task_status, create_task_type o create_priority.",
            "Para crear o modificar contactos, empresas o clientes, elegi type solo desde estas opciones disponibles por nombre:",
            this.formatEntityTypeOptionNames(optionNames.entityTypes),
            "No inventes IDs de empresas, clientes, contactos, proyectos u objetivos relacionados. Buscalos primero con la tool correspondiente; si no existen y el usuario quiere crearlos, crealos antes de usarlos como relacion.",
            "Si faltan datos minimos para crear la tarea, inferi un titulo razonable desde el mensaje del usuario.",
            "Si faltan datos minimos para crear una entidad, pedi solo los datos imprescindibles que no puedas inferir.",
            "Despues de registrar, encontrar o modificar una entidad, confirma el resultado y resume los campos relevantes.",
        ].join("\n");
    }

    private formatTaskOptionNames(taskOptionNames: TaskOptionNames): string {
        return [
            `- source: ${this.formatOptionList(taskOptionNames.sources)}`,
            `- status: ${this.formatOptionList(taskOptionNames.statuses)}`,
            `- type: ${this.formatOptionList(taskOptionNames.types)}`,
            `- priority: ${this.formatOptionList(taskOptionNames.priorities)}`,
        ].join("\n");
    }

    private formatEntityTypeOptionNames(entityTypeOptionNames: EntityTypeOptionNames): string {
        return [
            `- contact.type: ${this.formatOptionList(entityTypeOptionNames.contactTypes)}`,
            `- company.type: ${this.formatOptionList(entityTypeOptionNames.companyTypes)}`,
            `- client.type: ${this.formatOptionList(entityTypeOptionNames.clientTypes)}`,
        ].join("\n");
    }

    private formatOptionList(options: string[]): string {
        return options.length > 0 ? options.join(", ") : "(sin opciones disponibles)";
    }
}

export type {ChatbotTaskMessageInput, ChatbotTaskMessageOutput, ChatbotTaskSession};
export default ChatbotTaskService;
export {ChatbotTaskService};
