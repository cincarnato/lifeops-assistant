import type {IPromptTool} from "@drax/ai-back/types/interfaces/IAIProvider.js";
import GoogleContactsServiceFactory from "../factory/GoogleContactsServiceFactory.js";

interface GoogleContactsToolsContext {
    userId: string;
    connectionId?: string;
}

class GoogleContactsTools {
    static build(context: GoogleContactsToolsContext): IPromptTool[] {
        return [
            this.listContactsTool(context),
            this.createContactTool(context),
        ];
    }

    private static contactFieldArraySchema(description: string) {
        return {
            type: "array",
            description,
            items: {
                type: "object",
                properties: {
                    value: {type: "string"},
                    type: {type: "string", description: "Tipo opcional, por ejemplo home, work, mobile u other."},
                },
                required: ["value"],
                additionalProperties: false,
            },
        };
    }

    private static async executeWithLog<T>(toolName: string, args: any, payload: any, execute: () => Promise<T>): Promise<T> {
        console.info(`[GoogleContactsTools] ${toolName} called`, {
            args,
            payload,
        });

        try {
            const result = await execute();
            console.info(`[GoogleContactsTools] ${toolName} result`, {
                itemCount: Array.isArray((result as any)?.items) ? (result as any).items.length : undefined,
                hasNextPageToken: Boolean((result as any)?.nextPageToken),
                resourceName: (result as any)?.resourceName,
            });

            return result;
        } catch (error) {
            console.error(`[GoogleContactsTools] ${toolName} failed`, {
                args,
                payload,
                name: (error as any)?.name,
                message: (error as any)?.message,
                stack: (error as any)?.stack,
            });

            throw error;
        }
    }

    private static listContactsTool(context: GoogleContactsToolsContext): IPromptTool {
        return {
            name: "google_contacts_list_contacts",
            description: "Lista contactos de Google Contacts del usuario autenticado, con paginacion y orden opcional.",
            parameters: {
                type: "object",
                properties: {
                    connectionId: {
                        type: "string",
                        description: "ID opcional de una conexion Google especifica. Si no se informa, se usa la conexion del contexto o la primera conexion Contacts activa del usuario.",
                    },
                    limit: {type: "number", minimum: 1, maximum: 100, default: 25},
                    pageToken: {type: "string", description: "Token de paginacion devuelto por una llamada anterior."},
                    sortOrder: {
                        type: "string",
                        enum: ["LAST_MODIFIED_ASCENDING", "LAST_MODIFIED_DESCENDING", "FIRST_NAME_ASCENDING", "LAST_NAME_ASCENDING"],
                    },
                    personFields: {
                        type: "array",
                        items: {type: "string"},
                        description: "Campos People API a devolver. Por defecto devuelve nombres, emails, telefonos, organizaciones, direcciones, urls, biografias y fotos.",
                    },
                },
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const payload = {
                    userId: context.userId,
                    connectionId: args.connectionId ?? context.connectionId,
                    limit: args.limit,
                    pageToken: args.pageToken,
                    sortOrder: args.sortOrder,
                    personFields: args.personFields,
                };

                return await this.executeWithLog("google_contacts_list_contacts", args, payload, async () => {
                    return await GoogleContactsServiceFactory.instance.listContacts(payload);
                });
            },
        };
    }

    private static createContactTool(context: GoogleContactsToolsContext): IPromptTool {
        return {
            name: "google_contacts_create_contact",
            description: "Crea un contacto en Google Contacts para el usuario autenticado. Requiere permiso de escritura de Contacts.",
            parameters: {
                type: "object",
                properties: {
                    connectionId: {
                        type: "string",
                        description: "ID opcional de una conexion Google especifica. Si no se informa, se usa la primera conexion Contacts activa del usuario con permiso de escritura.",
                    },
                    displayName: {type: "string"},
                    givenName: {type: "string"},
                    familyName: {type: "string"},
                    middleName: {type: "string"},
                    emailAddresses: this.contactFieldArraySchema("Emails del contacto."),
                    phoneNumbers: this.contactFieldArraySchema("Telefonos del contacto."),
                    organizations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: {type: "string"},
                                title: {type: "string"},
                                department: {type: "string"},
                            },
                            additionalProperties: false,
                        },
                    },
                    biography: {type: "string", description: "Notas del contacto."},
                    urls: this.contactFieldArraySchema("URLs asociadas al contacto."),
                },
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const payload = {
                    userId: context.userId,
                    connectionId: args.connectionId ?? context.connectionId,
                    contact: {
                        displayName: args.displayName,
                        givenName: args.givenName,
                        familyName: args.familyName,
                        middleName: args.middleName,
                        emailAddresses: args.emailAddresses,
                        phoneNumbers: args.phoneNumbers,
                        organizations: args.organizations,
                        biography: args.biography,
                        urls: args.urls,
                    },
                };

                return await this.executeWithLog("google_contacts_create_contact", args, payload, async () => {
                    return await GoogleContactsServiceFactory.instance.createContact(payload);
                });
            },
        };
    }
}

export type {GoogleContactsToolsContext};
export default GoogleContactsTools;
export {GoogleContactsTools};
