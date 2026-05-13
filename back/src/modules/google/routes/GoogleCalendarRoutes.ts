import GoogleCalendarController from "../controllers/GoogleCalendarController.js";

async function GoogleCalendarFastifyRoutes(fastify, options) {

    const controller: GoogleCalendarController = new GoogleCalendarController();

    fastify.get('/api/google/calendar/calendars', (req, rep) => controller.listCalendars(req, rep));

    fastify.get('/api/google/calendar/events', (req, rep) => controller.listEvents(req, rep));

    fastify.post('/api/google/calendar/events', (req, rep) => controller.createEvent(req, rep));
}

export default GoogleCalendarFastifyRoutes;
export {GoogleCalendarFastifyRoutes};
