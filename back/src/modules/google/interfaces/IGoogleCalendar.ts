type GoogleCalendarDateTime = {
    date?: string;
    dateTime?: string;
    timeZone?: string;
}

type GoogleCalendarAttendee = {
    email: string;
    displayName?: string;
    optional?: boolean;
    responseStatus?: string;
}

type GoogleCalendarItem = {
    id: string;
    summary: string;
    description?: string;
    location?: string;
    timeZone?: string;
    primary?: boolean;
    accessRole?: string;
    backgroundColor?: string;
    foregroundColor?: string;
}

type GoogleCalendarEvent = {
    id: string;
    calendarId: string;
    htmlLink?: string;
    status?: string;
    summary: string;
    description?: string;
    location?: string;
    start: GoogleCalendarDateTime;
    end: GoogleCalendarDateTime;
    attendees: GoogleCalendarAttendee[];
    creator?: {
        email?: string;
        displayName?: string;
    };
    organizer?: {
        email?: string;
        displayName?: string;
    };
}

type GoogleCalendarListOptions = {
    userId: string;
    connectionId?: string;
    minAccessRole?: string;
}

type GoogleCalendarEventsListOptions = {
    userId: string;
    connectionId?: string;
    calendarId: string;
    timeMin?: string;
    timeMax?: string;
    search?: string;
    pageToken?: string;
    limit?: number;
}

type GoogleCalendarCreateEventInput = {
    calendarId: string;
    summary: string;
    description?: string;
    location?: string;
    start: GoogleCalendarDateTime;
    end: GoogleCalendarDateTime;
    attendees?: GoogleCalendarAttendee[];
}

type GoogleCalendarCreateEventOptions = {
    userId: string;
    connectionId?: string;
    event: GoogleCalendarCreateEventInput;
}

type GoogleCalendarEventsListResult = {
    items: GoogleCalendarEvent[];
    nextPageToken?: string;
}

export type {
    GoogleCalendarAttendee,
    GoogleCalendarCreateEventInput,
    GoogleCalendarCreateEventOptions,
    GoogleCalendarDateTime,
    GoogleCalendarEvent,
    GoogleCalendarEventsListOptions,
    GoogleCalendarEventsListResult,
    GoogleCalendarItem,
    GoogleCalendarListOptions,
}
