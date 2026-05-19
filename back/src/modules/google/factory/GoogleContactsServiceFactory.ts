import {GoogleContactsService} from "../services/GoogleContactsService.js";

class GoogleContactsServiceFactory {
    private static service: GoogleContactsService;

    public static get instance(): GoogleContactsService {
        if (!GoogleContactsServiceFactory.service) {
            GoogleContactsServiceFactory.service = new GoogleContactsService();
        }
        return GoogleContactsServiceFactory.service;
    }
}

export default GoogleContactsServiceFactory;
export {GoogleContactsServiceFactory};
