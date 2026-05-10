import {randomUUID} from "node:crypto";
import {AiProviderFactory} from "@drax/ai-back";
import TaskServiceFactory from "../factory/services/TaskServiceFactory.js";

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

        const response = await provider.prompt({
            systemPrompt: this.systemPrompt(),
            userInput: input.message,
            history,
            tools: [this.registerTaskTool(input.userId)],
            toolMaxIterations: 5,
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

    private registerTaskTool(userId: string) {
        return {
            name: "register_task",
            description: "Registra una tarea para el usuario autenticado cuando el usuario pide crear, guardar o registrar una tarea.",
            parameters: {
                type: "object",
                properties: {
                    title: {type: "string", description: "Titulo breve y accionable de la tarea."},
                    description: {type: "string", description: "Descripcion o contexto adicional."},
                    nextAction: {type: "string", description: "Proxima accion concreta, si se puede inferir."},
                    dueDate: {type: "string", description: "Fecha limite en formato ISO 8601."},
                    scheduledDate: {type: "string", description: "Fecha programada en formato ISO 8601."},
                    estimatedMinutes: {type: "number", description: "Minutos estimados."},
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
                const task = await taskService.create({
                    title: args.title,
                    description: args.description,
                    nextAction: args.nextAction,
                    dueDate: args.dueDate,
                    scheduledDate: args.scheduledDate,
                    estimatedMinutes: args.estimatedMinutes,
                    valueScore: args.valueScore,
                    motivationScore: args.motivationScore,
                    effortScore: args.effortScore,
                    urgencyScore: args.urgencyScore,
                    tags: args.tags ?? [],
                    notes: args.notes,
                    user: userId,
                });

                return {
                    _id: task._id,
                    title: task.title,
                    description: task.description,
                    dueDate: task.dueDate,
                    scheduledDate: task.scheduledDate,
                    estimatedMinutes: task.estimatedMinutes,
                    nextAction: task.nextAction,
                    tags: task.tags,
                };
            },
        };
    }

    private systemPrompt(): string {
        return [
            "Sos un asistente de LifeOps especializado en registrar tareas.",
            "Conversas en espanol claro y breve.",
            "Cuando el usuario pida registrar, crear, guardar o agendar una tarea, usa la tool register_task.",
            "Si faltan datos minimos para crear la tarea, inferi un titulo razonable desde el mensaje del usuario.",
            "No inventes IDs de entidades relacionadas. Si el usuario menciona proyecto, cliente, prioridad o estado sin ID, guardalo como texto en description, notes o tags.",
            "Despues de registrar una tarea, confirma que fue creada y resume los campos relevantes.",
        ].join("\n");
    }
}

export type {ChatbotTaskMessageInput, ChatbotTaskMessageOutput, ChatbotTaskSession};
export default ChatbotTaskService;
export {ChatbotTaskService};
