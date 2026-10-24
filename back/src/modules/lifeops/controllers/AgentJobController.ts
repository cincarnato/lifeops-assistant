
import AgentJobServiceFactory from "../factory/services/AgentJobServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import AgentJobPermissions from "../permissions/AgentJobPermissions.js";
import type {IAgentJob, IAgentJobBase} from "../interfaces/IAgentJob";

class AgentJobController extends AbstractFastifyController<IAgentJob, IAgentJobBase, IAgentJobBase>   {

    constructor() {
        super(AgentJobServiceFactory.instance, AgentJobPermissions)
        this.tenantField = "tenant";
        this.userField = "createdBy";
        
        this.tenantFilter = true;
        this.tenantSetter = true;
        this.tenantAssert = true;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

}

export default AgentJobController;
export {
    AgentJobController
}

