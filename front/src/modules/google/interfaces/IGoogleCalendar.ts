interface IGoogleCalendarDateTime {
  date?: string
  dateTime?: string
  timeZone?: string
}

interface IGoogleCalendarAttendee {
  email: string
  displayName?: string
  optional?: boolean
  responseStatus?: string
}

interface IGoogleCalendarItem {
  id: string
  summary: string
  description?: string
  location?: string
  timeZone?: string
  primary?: boolean
  accessRole?: string
  backgroundColor?: string
  foregroundColor?: string
}

interface IGoogleCalendarEvent {
  id: string
  calendarId: string
  htmlLink?: string
  status?: string
  summary: string
  description?: string
  location?: string
  start: IGoogleCalendarDateTime
  end: IGoogleCalendarDateTime
  attendees: IGoogleCalendarAttendee[]
  recurrence?: string[]
  creator?: {
    email?: string
    displayName?: string
  }
  organizer?: {
    email?: string
    displayName?: string
  }
}

interface IGoogleCalendarListOptions {
  connectionId?: string
  minAccessRole?: string
}

interface IGoogleCalendarEventsListOptions {
  connectionId?: string
  calendarId: string
  timeMin?: string
  timeMax?: string
  search?: string
  pageToken?: string
  limit?: number
}

interface IGoogleCalendarCreateEventInput {
  connectionId?: string
  calendarId: string
  summary: string
  description?: string
  location?: string
  start: IGoogleCalendarDateTime
  end: IGoogleCalendarDateTime
  attendees?: IGoogleCalendarAttendee[]
  recurrence?: string[]
}

interface IGoogleCalendarEventsListResult {
  items: IGoogleCalendarEvent[]
  nextPageToken?: string
}

export type {
  IGoogleCalendarAttendee,
  IGoogleCalendarCreateEventInput,
  IGoogleCalendarDateTime,
  IGoogleCalendarEvent,
  IGoogleCalendarEventsListOptions,
  IGoogleCalendarEventsListResult,
  IGoogleCalendarItem,
  IGoogleCalendarListOptions,
}
