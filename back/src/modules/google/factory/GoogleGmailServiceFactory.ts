import {GoogleGmailService} from "../services/GoogleGmailService.js";

class GoogleGmailServiceFactory {
    private static service: GoogleGmailService;

    public static get instance(): GoogleGmailService {
        if (!GoogleGmailServiceFactory.service) {
            GoogleGmailServiceFactory.service = new GoogleGmailService();
        }
        return GoogleGmailServiceFactory.service;
    }
}

export default GoogleGmailServiceFactory;
export {GoogleGmailServiceFactory};
