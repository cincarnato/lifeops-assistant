import {TaskScheduleJob} from "../../jobs/TaskScheduleJob.js";
import TaskScheduleServiceFactory from "./TaskScheduleServiceFactory.js";

class TaskScheduleJobFactory {
    private static service: TaskScheduleJob;

    public static get instance(): TaskScheduleJob {
        if (!TaskScheduleJobFactory.service) {
            TaskScheduleJobFactory.service = new TaskScheduleJob(TaskScheduleServiceFactory.instance);
        }

        return TaskScheduleJobFactory.service;
    }
}

export default TaskScheduleJobFactory
export {
    TaskScheduleJobFactory
}
