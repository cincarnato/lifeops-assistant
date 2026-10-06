import {TaskArchiveJob} from "../../jobs/TaskArchiveJob.js";
import TaskServiceFactory from "./TaskServiceFactory.js";

class TaskArchiveJobFactory {
    private static service: TaskArchiveJob;

    public static get instance(): TaskArchiveJob {
        if (!TaskArchiveJobFactory.service) {
            TaskArchiveJobFactory.service = new TaskArchiveJob(TaskServiceFactory.instance);
        }

        return TaskArchiveJobFactory.service;
    }
}

export default TaskArchiveJobFactory
export {
    TaskArchiveJobFactory
}
