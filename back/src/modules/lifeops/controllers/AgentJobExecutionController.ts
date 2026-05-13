
import AgentJobExecutionServiceFactory from "../factory/services/AgentJobExecutionServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import AgentJobExecutionPermissions from "../permissions/AgentJobExecutionPermissions.js";
import type {IAgentJobExecution, IAgentJobExecutionBase} from "../interfaces/IAgentJobExecution";

class AgentJobExecutionController extends AbstractFastifyController<IAgentJobExecution, IAgentJobExecutionBase, IAgentJobExecutionBase>   {

    constructor() {
        super(AgentJobExecutionServiceFactory.instance, AgentJobExecutionPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

}

export default AgentJobExecutionController;
export {
    AgentJobExecutionController
}

