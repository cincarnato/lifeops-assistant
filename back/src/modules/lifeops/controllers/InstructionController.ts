
import InstructionServiceFactory from "../factory/services/InstructionServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import InstructionPermissions from "../permissions/InstructionPermissions.js";
import type {IInstruction, IInstructionBase} from "../interfaces/IInstruction";

class InstructionController extends AbstractFastifyController<IInstruction, IInstructionBase, IInstructionBase>   {

    constructor() {
        super(InstructionServiceFactory.instance, InstructionPermissions)
        this.tenantField = "tenant";
        this.userField = "user";

        this.tenantFilter = true;
        this.tenantSetter = true;
        this.tenantAssert = true;

        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

}

export default InstructionController;
export {
    InstructionController
}
