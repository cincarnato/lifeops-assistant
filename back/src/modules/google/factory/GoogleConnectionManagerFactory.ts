import {GoogleConnectionManager} from "../services/GoogleConnectionManager.js";

class GoogleConnectionManagerFactory {
    private static manager: GoogleConnectionManager;

    public static get instance(): GoogleConnectionManager {
        if (!GoogleConnectionManagerFactory.manager) {
            GoogleConnectionManagerFactory.manager = new GoogleConnectionManager();
        }

        return GoogleConnectionManagerFactory.manager;
    }
}

export default GoogleConnectionManagerFactory;
export {GoogleConnectionManagerFactory};
