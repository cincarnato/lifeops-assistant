import type {IPromptTool} from "@drax/ai-back/types/interfaces/IAIProvider.js";
import GoogleCalendarServiceFactory from "../factory/GoogleCalendarServiceFactory.js";

interface GoogleCalendarToolsContext {
    userId: string;
    connectionId?: string;
}

class GoogleCalendarTools {
    static build(context: GoogleCalendarToolsContext): IPromptTool[] {
        return [
            this.listCalendarsTool(context),
            this.listEventsTool(context),
            this.createEventTool(context),
        ];
    }

    private static dateTimeSchema(description: string) {
        return {
            type: "object",
            description,
            properties: {
                date: {type: "string", description: "Fecha de dia completo en formato YYYY-MM-DD."},
                dateTime: {type: "string", description: "Fecha y hora en formato ISO 8601."},
                timeZone: {type: "string", description: "Zona horaria IANA, por ejemplo America/Argentina/Buenos_Aires."},
            },
            additionalProperties: false,
        };
    }

    private static attendeeArraySchema() {
        return {
            type: "array",
            items: {
                type: "object",
                properties: {
                    email: {type: "string"},
                    displayName: {type: "string"},
                    optional: {type: "boolean"},
                    responseStatus: {type: "string"},
                },
                required: ["email"],
                additionalProperties: false,
            },
        };
    }

    private static recurrenceArraySchema() {
        return {
            type: "array",
            description: "Reglas de recurrencia compatibles con Google Calendar en formato RFC5545. Usar RRULE, EXRULE, RDATE o EXDATE. No incluir DTSTART ni DTEND; esas fechas van en start/end. Ejemplo semanal martes: RRULE:FREQ=WEEKLY;BYDAY=TU.",
            items: {
                type: "string",
                description: "Linea de recurrencia, por ejemplo RRULE:FREQ=WEEKLY;BYDAY=TU o RRULE:FREQ=WEEKLY;BYDAY=TU;UNTIL=20261231T235959Z.",
            },
        };
    }

    private static buildTemporalDebugContext() {
        const now = new Date();
        const today = this.formatLocalDate(now);
        const tomorrow = this.addDays(today, 1);
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "timezone local del servidor";
        const timeZoneOffset = this.formatLocalTimeZoneOffset(now);

        return {
            nowIso: now.toISOString(),
            localDate: today,
            tomorrow,
            timeZone,
            timeZoneOffset,
        };
    }

    private static formatLocalDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    private static addDays(date: string, days: number): string {
        const [year, month, day] = date.split("-").map(Number);
        const nextDate = new Date(year, month - 1, day + days);

        return this.formatLocalDate(nextDate);
    }

    private static formatLocalTimeZoneOffset(date: Date): string {
        const offsetMinutes = -date.getTimezoneOffset();
        const sign = offsetMinutes >= 0 ? "+" : "-";
        const absoluteMinutes = Math.abs(offsetMinutes);
        const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
        const minutes = String(absoluteMinutes % 60).padStart(2, "0");

        return `${sign}${hours}:${minutes}`;
    }

    private static async executeWithLog<T>(toolName: string, args: any, payload: any, execute: () => Promise<T>): Promise<T> {
        console.info(`[GoogleCalendarTools] ${toolName} called`, {
            args,
            payload,
        });

        try {
            const result = await execute();
            console.info(`[GoogleCalendarTools] ${toolName} result`, {
                itemCount: Array.isArray((result as any)?.items) ? (result as any).items.length : undefined,
                hasNextPageToken: Boolean((result as any)?.nextPageToken),
                resultId: (result as any)?.id,
                resultStart: (result as any)?.start,
                resultEnd: (result as any)?.end,
            });

            return result;
        } catch (error) {
            console.error(`[GoogleCalendarTools] ${toolName} failed`, {
                args,
                payload,
                name: (error as any)?.name,
                message: (error as any)?.message,
                stack: (error as any)?.stack,
            });

            throw error;
        }
    }

    private static listCalendarsTool(context: GoogleCalendarToolsContext): IPromptTool {
        return {
            name: "google_calendar_list_calendars",
            description: "Lista los calendarios disponibles para el usuario autenticado.",
            parameters: {
                type: "object",
                properties: {
                    connectionId: {
                        type: "string",
                        description: "ID opcional de una conexion Google especifica. Si no se informa, se usa la conexion del contexto o la primera conexion Calendar activa del usuario.",
                    },
                    minAccessRole: {
                        type: "string",
                        enum: ["freeBusyReader", "reader", "writer", "owner"],
                        description: "Rol minimo de acceso para filtrar calendarios.",
                    },
                },
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const payload = {
                    userId: context.userId,
                    connectionId: args.connectionId ?? context.connectionId,
                    minAccessRole: args.minAccessRole,
                };

                return await this.executeWithLog("google_calendar_list_calendars", args, payload, async () => {
                    return await GoogleCalendarServiceFactory.instance.listCalendars(payload);
                });
            },
        };
    }

    private static listEventsTool(context: GoogleCalendarToolsContext): IPromptTool {
        return {
            name: "google_calendar_list_events",
            description: "Lista eventos de un calendario Google del usuario autenticado, con filtros de rango temporal, busqueda y paginacion.",
            parameters: {
                type: "object",
                properties: {
                    connectionId: {
                        type: "string",
                        description: "ID opcional de una conexion Google especifica. Si no se informa, se usa la conexion del contexto o la primera conexion Calendar activa del usuario.",
                    },
                    calendarId: {type: "string", description: "ID del calendario. Usa primary para el calendario principal."},
                    timeMin: {type: "string", description: "Inicio del rango en formato ISO 8601."},
                    timeMax: {type: "string", description: "Fin del rango en formato ISO 8601."},
                    search: {type: "string", description: "Texto de busqueda sobre los eventos."},
                    pageToken: {type: "string", description: "Token de paginacion devuelto por una llamada anterior."},
                    limit: {type: "number", minimum: 1, maximum: 100, default: 25},
                },
                required: ["calendarId"],
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const payload = {
                    userId: context.userId,
                    connectionId: args.connectionId ?? context.connectionId,
                    calendarId: args.calendarId,
                    timeMin: args.timeMin,
                    timeMax: args.timeMax,
                    search: args.search,
                    pageToken: args.pageToken,
                    limit: args.limit,
                };

                return await this.executeWithLog("google_calendar_list_events", args, payload, async () => {
                    return await GoogleCalendarServiceFactory.instance.listEvents(payload);
                });
            },
        };
    }

    private static createEventTool(context: GoogleCalendarToolsContext): IPromptTool {
        return {
            name: "google_calendar_create_event",
            description: "Crea un evento en Google Calendar para el usuario autenticado. Requiere permisos de escritura de Calendar.",
            parameters: {
                type: "object",
                properties: {
                    connectionId: {
                        type: "string",
                        description: "ID opcional de una conexion Google especifica. Si no se informa, se usa la conexion del contexto o la primera conexion Calendar activa del usuario.",
                    },
                    calendarId: {type: "string", description: "ID del calendario donde crear el evento. Usa primary para el calendario principal."},
                    summary: {type: "string", description: "Titulo del evento."},
                    description: {type: "string"},
                    location: {type: "string"},
                    start: this.dateTimeSchema("Inicio del evento. Usar date para eventos de dia completo o dateTime para eventos con hora."),
                    end: this.dateTimeSchema("Fin del evento. Usar date para eventos de dia completo o dateTime para eventos con hora."),
                    attendees: this.attendeeArraySchema(),
                    recurrence: this.recurrenceArraySchema(),
                },
                required: ["calendarId", "summary", "start", "end"],
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const temporalDebugContext = this.buildTemporalDebugContext();
                const payload = {
                    userId: context.userId,
                    connectionId: args.connectionId ?? context.connectionId,
                    event: {
                        calendarId: args.calendarId,
                        summary: args.summary,
                        description: args.description,
                        location: args.location,
                        start: args.start,
                        end: args.end,
                        attendees: args.attendees,
                        recurrence: args.recurrence,
                    },
                };

                console.info("[GoogleCalendarTools] google_calendar_create_event temporal_debug", {
                    temporalDebugContext,
                    requestedStart: args.start,
                    requestedEnd: args.end,
                    requestedRecurrence: args.recurrence,
                    expectedTomorrowDate: temporalDebugContext.tomorrow,
                    startMatchesTomorrowDate: args.start?.date === temporalDebugContext.tomorrow
                        || typeof args.start?.dateTime === "string" && args.start.dateTime.startsWith(`${temporalDebugContext.tomorrow}T`),
                });

                return await this.executeWithLog("google_calendar_create_event", args, payload, async () => {
                    return await GoogleCalendarServiceFactory.instance.createEvent(payload);
                });
            },
        };
    }
}

export type {GoogleCalendarToolsContext};
export default GoogleCalendarTools;
export {GoogleCalendarTools};
