import {FirebasePushService} from "../../services/FirebasePushService.js";

class FirebasePushServiceFactory {
    private static service: FirebasePushService;

    static get instance(): FirebasePushService {
        if (!FirebasePushServiceFactory.service) {
            FirebasePushServiceFactory.service = new FirebasePushService();
        }

        return FirebasePushServiceFactory.service;
    }
}

export default FirebasePushServiceFactory;
export {FirebasePushServiceFactory};
