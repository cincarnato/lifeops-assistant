import {OAuth2Client} from "google-auth-library";
import GoogleConnectionServiceFactory from "../factory/services/GoogleConnectionServiceFactory.js";
import type {IGoogleConnection} from "../interfaces/IGoogleConnection";
import type {
    GoogleCalendarCreateEventOptions,
    GoogleCalendarEvent,
    GoogleCalendarEventsListOptions,
    GoogleCalendarEventsListResult,
    GoogleCalendarItem,
    GoogleCalendarListOptions,
} from "../interfaces/IGoogleCalendar";

const CALENDAR_READONLY_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const CALENDAR_EVENTS_SCOPE = "https://www.googleapis.com/auth/calendar.events";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

class GoogleCalendarService {

    async listCalendars(options: GoogleCalendarListOptions): Promise<{items: GoogleCalendarItem[]}> {
        const connection = await this.resolveConnection(options.userId, options.connectionId, false);
        const accessToken = await this.getAccessToken(connection);
        const params = new URLSearchParams();
        if (options.minAccessRole) {
            params.set("minAccessRole", options.minAccessRole);
        }

        const response = await this.calendarFetch<{items?: any[]}>(
            `https://www.googleapis.com/calendar/v3/users/me/calendarList${params.toString() ? `?${params.toString()}` : ""}`,
            accessToken
        );

        return {
            items: (response.items || []).map(calendar => this.mapCalendar(calendar)),
        };
    }

    async listEvents(options: GoogleCalendarEventsListOptions): Promise<GoogleCalendarEventsListResult> {
        const connection = await this.resolveConnection(options.userId, options.connectionId, false);
        const accessToken = await this.getAccessToken(connection);
        const params = new URLSearchParams({
            singleEvents: "true",
            orderBy: "startTime",
            maxResults: String(Math.min(Math.max(Number(options.limit) || 25, 1), 100)),
        });

        if (options.timeMin) params.set("timeMin", options.timeMin);
        if (options.timeMax) params.set("timeMax", options.timeMax);
        if (options.search?.trim()) params.set("q", options.search.trim());
        if (options.pageToken) params.set("pageToken", options.pageToken);

        const response = await this.calendarFetch<{items?: any[]; nextPageToken?: string}>(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(options.calendarId)}/events?${params.toString()}`,
            accessToken
        );

        return {
            items: (response.items || []).map(event => this.mapEvent(event, options.calendarId)),
            nextPageToken: response.nextPageToken,
        };
    }

    async createEvent(options: GoogleCalendarCreateEventOptions): Promise<GoogleCalendarEvent> {
        const connection = await this.resolveConnection(options.userId, options.connectionId, true);
        const accessToken = await this.getAccessToken(connection);
        const event = options.event;

        if (!event.calendarId || !event.summary || !event.start || !event.end) {
            throw new Error("google.calendar.event.required");
        }

        const response = await this.calendarFetch<any>(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(event.calendarId)}/events`,
            accessToken,
            {
                method: "POST",
                body: JSON.stringify({
                    summary: event.summary,
                    description: event.description,
                    location: event.location,
                    start: event.start,
                    end: event.end,
                    attendees: event.attendees || [],
                }),
            }
        );

        return this.mapEvent(response, event.calendarId);
    }

    private async resolveConnection(userId: string, connectionId?: string, requireWrite = false): Promise<IGoogleConnection> {
        const service = GoogleConnectionServiceFactory.instance;
        const connection = connectionId
            ? await service.findById(connectionId)
            : (await service.findBy("userId", userId, 20)).find(item => this.canReadCalendar(item));

        if (!connection || this.getConnectionUserId(connection) !== userId) {
            throw new Error("google.connection.not_found");
        }

        if (requireWrite && !this.canWriteCalendar(connection)) {
            throw new Error("google.calendar.write_scope.required");
        }

        if (!requireWrite && !this.canReadCalendar(connection)) {
            throw new Error("google.calendar.scope.required");
        }

        return connection;
    }

    private canReadCalendar(connection: IGoogleConnection): boolean {
        return connection.status === "active" && (
            connection.scope?.includes(CALENDAR_READONLY_SCOPE) ||
            connection.scope?.includes(CALENDAR_EVENTS_SCOPE) ||
            connection.scope?.includes(CALENDAR_SCOPE)
        );
    }

    private canWriteCalendar(connection: IGoogleConnection): boolean {
        return connection.status === "active" && (
            connection.scope?.includes(CALENDAR_EVENTS_SCOPE) ||
            connection.scope?.includes(CALENDAR_SCOPE)
        );
    }

    private getConnectionUserId(connection: IGoogleConnection): string {
        const userId = connection.userId;
        if (typeof userId === "string") {
            return userId;
        }
        return userId?._id?.toString?.() || userId?.id?.toString?.() || "";
    }

    private async getAccessToken(connection: IGoogleConnection): Promise<string> {
        const expiryTime = connection.expiryDate ? new Date(connection.expiryDate).getTime() : 0;
        if (connection.accessToken && expiryTime > Date.now() + 60000) {
            return connection.accessToken;
        }

        const client = new OAuth2Client({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        });
        client.setCredentials({
            refresh_token: connection.refreshToken,
        });

        const {credentials} = await client.refreshAccessToken();
        const accessToken = credentials.access_token;
        if (!accessToken) {
            throw new Error("google.access_token.required");
        }

        await GoogleConnectionServiceFactory.instance.updatePartial(connection._id, {
            accessToken,
            expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600000),
            lastUsedAt: new Date(),
        } as any);

        return accessToken;
    }

    private async calendarFetch<T>(url: string, accessToken: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`google.calendar.request_failed:${response.status}:${body}`);
        }

        return await response.json() as T;
    }

    private mapCalendar(calendar: any): GoogleCalendarItem {
        return {
            id: calendar.id,
            summary: calendar.summary || calendar.id,
            description: calendar.description,
            location: calendar.location,
            timeZone: calendar.timeZone,
            primary: calendar.primary,
            accessRole: calendar.accessRole,
            backgroundColor: calendar.backgroundColor,
            foregroundColor: calendar.foregroundColor,
        };
    }

    private mapEvent(event: any, calendarId: string): GoogleCalendarEvent {
        return {
            id: event.id,
            calendarId,
            htmlLink: event.htmlLink,
            status: event.status,
            summary: event.summary || "(Sin titulo)",
            description: event.description,
            location: event.location,
            start: event.start || {},
            end: event.end || {},
            attendees: event.attendees || [],
            creator: event.creator,
            organizer: event.organizer,
        };
    }
}

export default GoogleCalendarService;
export {GoogleCalendarService};
