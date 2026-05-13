import {AgentJobRunnerService} from "../../services/AgentJobRunnerService.js";
import AgentJobServiceFactory from "./AgentJobServiceFactory.js";
import AgentJobExecutionServiceFactory from "./AgentJobExecutionServiceFactory.js";

class AgentJobRunnerServiceFactory {
    private static service: AgentJobRunnerService;

    public static get instance(): AgentJobRunnerService {
        if (!AgentJobRunnerServiceFactory.service) {
            AgentJobRunnerServiceFactory.service = new AgentJobRunnerService(
                AgentJobServiceFactory.instance,
                AgentJobExecutionServiceFactory.instance
            );
        }

        return AgentJobRunnerServiceFactory.service;
    }
}

export default AgentJobRunnerServiceFactory
export {
    AgentJobRunnerServiceFactory
}
