import {AgentJob} from "../../jobs/AgentJob.js";
import AgentJobServiceFactory from "./AgentJobServiceFactory.js";
import AgentJobExecutionServiceFactory from "./AgentJobExecutionServiceFactory.js";

class AgentJobFactory {
    private static service: AgentJob;

    public static get instance(): AgentJob {
        if (!AgentJobFactory.service) {
            AgentJobFactory.service = new AgentJob(
                AgentJobServiceFactory.instance,
                AgentJobExecutionServiceFactory.instance
            );
        }

        return AgentJobFactory.service;
    }
}

export default AgentJobFactory
export {
    AgentJobFactory
}
