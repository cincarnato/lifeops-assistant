import DayPlanJob from "../../jobs/DayPlanJob.js";

class DayPlanJobFactory {
    private static job: DayPlanJob;

    public static get instance(): DayPlanJob {
        if (!DayPlanJobFactory.job) {
            DayPlanJobFactory.job = new DayPlanJob();
        }

        return DayPlanJobFactory.job;
    }
}

export default DayPlanJobFactory;
export {DayPlanJobFactory};
