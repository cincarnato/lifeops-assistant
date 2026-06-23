import {TaskTriageService} from "../../services/TaskTriageService.js";

class TaskTriageServiceFactory {
    private static service: TaskTriageService;

    public static get instance(): TaskTriageService {
        if (!TaskTriageServiceFactory.service) {
            TaskTriageServiceFactory.service = new TaskTriageService();
        }

        return TaskTriageServiceFactory.service;
    }
}

export default TaskTriageServiceFactory;
export {TaskTriageServiceFactory};
