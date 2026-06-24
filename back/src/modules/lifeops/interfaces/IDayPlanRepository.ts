
import type {IDayPlan, IDayPlanBase} from './IDayPlan'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IDayPlanRepository extends IDraxCrudRepository<IDayPlan, IDayPlanBase, IDayPlanBase>{

}

export {IDayPlanRepository}


