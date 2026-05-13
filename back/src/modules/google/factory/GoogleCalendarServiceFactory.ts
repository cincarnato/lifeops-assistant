import {GoogleCalendarService} from "../services/GoogleCalendarService.js";

class GoogleCalendarServiceFactory {
    private static service: GoogleCalendarService;

    public static get instance(): GoogleCalendarService {
        if (!GoogleCalendarServiceFactory.service) {
            GoogleCalendarServiceFactory.service = new GoogleCalendarService();
        }
        return GoogleCalendarServiceFactory.service;
    }
}

export default GoogleCalendarServiceFactory;
export {GoogleCalendarServiceFactory};
