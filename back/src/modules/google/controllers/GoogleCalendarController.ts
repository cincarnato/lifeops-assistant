import type {FastifyReply, FastifyRequest} from "fastify";
import GoogleCalendarServiceFactory from "../factory/GoogleCalendarServiceFactory.js";
import type {GoogleCalendarCreateEventInput} from "../interfaces/IGoogleCalendar";

type GoogleCalendarQuery = {
    connectionId?: string;
    minAccessRole?: string;
}

type GoogleCalendarEventsQuery = {
    connectionId?: string;
    calendarId?: string;
    timeMin?: string;
    timeMax?: string;
    search?: string;
    pageToken?: string;
    limit?: number;
}

type GoogleCalendarCreateEventBody = GoogleCalendarCreateEventInput & {
    connectionId?: string;
}

class GoogleCalendarController {

    async listCalendars(request: FastifyRequest<{Querystring: GoogleCalendarQuery}>, reply: FastifyReply) {
        try {
            const userId = this.getAuthenticatedUserId(request);
            if (!userId) {
                reply.code(401);
                return reply.send({error: "error.unauthorized"});
            }

            return await GoogleCalendarServiceFactory.instance.listCalendars({
                userId,
                connectionId: request.query?.connectionId,
                minAccessRole: request.query?.minAccessRole,
            });
        } catch (e) {
            console.error("/api/google/calendar/calendars error", e);
            reply.code(500);
            reply.send({error: e?.message || "error.server"});
        }
    }

    async listEvents(request: FastifyRequest<{Querystring: GoogleCalendarEventsQuery}>, reply: FastifyReply) {
        try {
            const userId = this.getAuthenticatedUserId(request);
            if (!userId) {
                reply.code(401);
                return reply.send({error: "error.unauthorized"});
            }

            const query = request.query || {};
            if (!query.calendarId) {
                reply.code(400);
                return reply.send({error: "google.calendar.calendar_id.required"});
            }

            return await GoogleCalendarServiceFactory.instance.listEvents({
                userId,
                connectionId: query.connectionId,
                calendarId: query.calendarId,
                timeMin: query.timeMin,
                timeMax: query.timeMax,
                search: query.search,
                pageToken: query.pageToken,
                limit: Number(query.limit) || 25,
            });
        } catch (e) {
            console.error("/api/google/calendar/events error", e);
            reply.code(500);
            reply.send({error: e?.message || "error.server"});
        }
    }

    async createEvent(request: FastifyRequest<{Body: GoogleCalendarCreateEventBody}>, reply: FastifyReply) {
        try {
            const userId = this.getAuthenticatedUserId(request);
            if (!userId) {
                reply.code(401);
                return reply.send({error: "error.unauthorized"});
            }

            const body = request.body || {} as GoogleCalendarCreateEventBody;
            return await GoogleCalendarServiceFactory.instance.createEvent({
                userId,
                connectionId: body.connectionId,
                event: {
                    calendarId: body.calendarId,
                    summary: body.summary,
                    description: body.description,
                    location: body.location,
                    start: body.start,
                    end: body.end,
                    attendees: body.attendees,
                    recurrence: body.recurrence,
                },
            });
        } catch (e) {
            console.error("/api/google/calendar/events create error", e);
            reply.code(500);
            reply.send({error: e?.message || "error.server"});
        }
    }

    private getAuthenticatedUserId(request: FastifyRequest): string {
        return (request as any).authUser?.id || (request as any).rbac?.user?.id || "";
    }
}

export default GoogleCalendarController;
export {GoogleCalendarController};
