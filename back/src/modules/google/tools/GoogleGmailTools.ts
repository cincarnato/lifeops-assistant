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
            this.sendMessageTool(context),
            this.modifyLabelsTool(context),
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

    private static sendMessageTool(context: GoogleGmailToolsContext): IPromptTool {
        return {
            name: "google_gmail_send_message",
            description: "Envia un email desde Gmail del usuario autenticado. Requiere una conexion Google con permiso gmail.send.",
            parameters: {
                type: "object",
                properties: {
                    connectionId: {
                        type: "string",
                        description: "ID opcional de una conexion Google especifica. Si no se informa, se usa la primera conexion Gmail activa del usuario con permiso de envio.",
                    },
                    to: {
                        type: "array",
                        items: {type: "string"},
                        minItems: 1,
                        description: "Destinatarios principales. Usar emails validos o encabezados tipo Nombre <email@dominio.com>.",
                    },
                    cc: {
                        type: "array",
                        items: {type: "string"},
                        description: "Destinatarios en copia.",
                    },
                    bcc: {
                        type: "array",
                        items: {type: "string"},
                        description: "Destinatarios en copia oculta.",
                    },
                    subject: {type: "string", description: "Asunto del email."},
                    bodyText: {type: "string", description: "Cuerpo del email en texto plano."},
                    bodyHtml: {type: "string", description: "Cuerpo del email en HTML. Si se informa junto con bodyText, se envia multipart/alternative."},
                    replyTo: {type: "string", description: "Direccion Reply-To opcional."},
                    threadId: {type: "string", description: "Thread ID opcional para enviar dentro de una conversacion existente."},
                },
                required: ["to", "subject"],
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const payload = {
                    userId: context.userId,
                    connectionId: args.connectionId ?? context.connectionId,
                    to: args.to,
                    cc: args.cc,
                    bcc: args.bcc,
                    subject: args.subject,
                    bodyText: args.bodyText,
                    bodyHtml: args.bodyHtml,
                    replyTo: args.replyTo,
                    threadId: args.threadId,
                };

                const loggedArgs = {
                    ...args,
                    bodyText: args.bodyText ? "[redacted]" : undefined,
                    bodyHtml: args.bodyHtml ? "[redacted]" : undefined,
                };

                return await this.executeWithLog("google_gmail_send_message", loggedArgs, {
                    ...payload,
                    bodyText: payload.bodyText ? "[redacted]" : undefined,
                    bodyHtml: payload.bodyHtml ? "[redacted]" : undefined,
                }, async () => {
                    return await GoogleGmailServiceFactory.instance.sendMessage(payload);
                });
            },
        };
    }

    private static modifyLabelsTool(context: GoogleGmailToolsContext): IPromptTool {
        return {
            name: "google_gmail_modify_message_labels",
            description: "Agrega o quita etiquetas de un email de Gmail del usuario autenticado. Requiere permiso gmail.modify. Usa IDs de labels Gmail, por ejemplo INBOX, STARRED, UNREAD o Label_123.",
            parameters: {
                type: "object",
                properties: {
                    connectionId: {
                        type: "string",
                        description: "ID opcional de una conexion Google especifica. Si no se informa, se usa la primera conexion Gmail activa del usuario con permiso de modificacion.",
                    },
                    messageId: {type: "string", description: "ID exacto del mensaje Gmail a etiquetar."},
                    addLabelIds: {
                        type: "array",
                        items: {type: "string"},
                        description: "IDs de labels a agregar al mensaje, por ejemplo STARRED, IMPORTANT o Label_123.",
                    },
                    removeLabelIds: {
                        type: "array",
                        items: {type: "string"},
                        description: "IDs de labels a quitar del mensaje, por ejemplo UNREAD, INBOX o Label_123.",
                    },
                },
                required: ["messageId"],
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const payload = {
                    userId: context.userId,
                    connectionId: args.connectionId ?? context.connectionId,
                    messageId: args.messageId,
                    addLabelIds: args.addLabelIds,
                    removeLabelIds: args.removeLabelIds,
                };

                return await this.executeWithLog("google_gmail_modify_message_labels", args, payload, async () => {
                    return await GoogleGmailServiceFactory.instance.modifyLabels(payload);
                });
            },
        };
    }
}

export type {GoogleGmailToolsContext};
export default GoogleGmailTools;
export {GoogleGmailTools};
