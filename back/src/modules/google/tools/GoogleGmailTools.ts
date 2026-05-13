import type {IPromptTool} from "@drax/ai-back/types/interfaces/IAIProvider.js";
import GoogleGmailServiceFactory from "../factory/GoogleGmailServiceFactory.js";

interface GoogleGmailToolsContext {
    userId: string;
    connectionId?: string;
}

class GoogleGmailTools {
    static build(context: GoogleGmailToolsContext): IPromptTool[] {
        return [
            this.listMessagesTool(context),
            this.getMessageTool(context),
        ];
    }

    private static async executeWithLog<T>(toolName: string, args: any, payload: any, execute: () => Promise<T>): Promise<T> {
        console.info(`[GoogleGmailTools] ${toolName} called`, {
            args,
            payload,
        });

        try {
            const result = await execute();
            console.info(`[GoogleGmailTools] ${toolName} result`, {
                itemCount: Array.isArray((result as any)?.items) ? (result as any).items.length : undefined,
                hasNextPageToken: Boolean((result as any)?.nextPageToken),
                resultId: (result as any)?.id,
            });

            return result;
        } catch (error) {
            console.error(`[GoogleGmailTools] ${toolName} failed`, {
                args,
                payload,
                name: (error as any)?.name,
                message: (error as any)?.message,
                stack: (error as any)?.stack,
            });

            throw error;
        }
    }

    private static listMessagesTool(context: GoogleGmailToolsContext): IPromptTool {
        return {
            name: "google_gmail_list_messages",
            description: "Lista emails de Gmail del usuario autenticado. Usa filtros de busqueda, remitente, destinatario, asunto, fechas, etiquetas, no leidos o adjuntos.",
            parameters: {
                type: "object",
                properties: {
                    connectionId: {
                        type: "string",
                        description: "ID opcional de una conexion Google especifica. Si no se informa, se usa la conexion del contexto o la primera conexion Gmail activa del usuario.",
                    },
                    limit: {type: "number", minimum: 1, maximum: 50, default: 10},
                    pageToken: {type: "string", description: "Token de paginacion devuelto por una llamada anterior."},
                    search: {type: "string", description: "Consulta libre compatible con Gmail search."},
                    labelIds: {
                        type: "array",
                        items: {type: "string"},
                        description: "IDs de labels Gmail, por ejemplo INBOX, SENT, UNREAD o STARRED.",
                    },
                    from: {type: "string", description: "Email o texto de remitente para filtrar."},
                    to: {type: "string", description: "Email o texto de destinatario para filtrar."},
                    subject: {type: "string", description: "Texto del asunto para filtrar."},
                    after: {type: "string", description: "Fecha desde en formato aceptado por Gmail, por ejemplo YYYY/MM/DD."},
                    before: {type: "string", description: "Fecha hasta en formato aceptado por Gmail, por ejemplo YYYY/MM/DD."},
                    unread: {type: "boolean", description: "true para no leidos, false para excluir no leidos."},
                    hasAttachment: {type: "boolean", description: "true para emails con adjuntos, false para excluir adjuntos."},
                },
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const payload = {
                    userId: context.userId,
                    connectionId: args.connectionId ?? context.connectionId,
                    limit: args.limit,
                    pageToken: args.pageToken,
                    search: args.search,
                    labelIds: args.labelIds,
                    from: args.from,
                    to: args.to,
                    subject: args.subject,
                    after: args.after,
                    before: args.before,
                    unread: args.unread,
                    hasAttachment: args.hasAttachment,
                };

                return await this.executeWithLog("google_gmail_list_messages", args, payload, async () => {
                    return await GoogleGmailServiceFactory.instance.listMessages(payload);
                });
            },
        };
    }

    private static getMessageTool(context: GoogleGmailToolsContext): IPromptTool {
        return {
            name: "google_gmail_get_message",
            description: "Obtiene el contenido completo de un email de Gmail del usuario autenticado por messageId, incluyendo cuerpo, destinatarios y adjuntos metadata.",
            parameters: {
                type: "object",
                properties: {
                    connectionId: {
                        type: "string",
                        description: "ID opcional de una conexion Google especifica. Si no se informa, se usa la conexion del contexto o la primera conexion Gmail activa del usuario.",
                    },
                    messageId: {type: "string", description: "ID exacto del mensaje Gmail."},
                },
                required: ["messageId"],
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const payload = {
                    userId: context.userId,
                    connectionId: args.connectionId ?? context.connectionId,
                    messageId: args.messageId,
                };

                return await this.executeWithLog("google_gmail_get_message", args, payload, async () => {
                    return await GoogleGmailServiceFactory.instance.getMessage(payload);
                });
            },
        };
    }
}

export type {GoogleGmailToolsContext};
export default GoogleGmailTools;
export {GoogleGmailTools};
