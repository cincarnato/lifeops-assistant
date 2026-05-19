
import type {IPushDevice, IPushDeviceBase} from './IPushDevice'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IPushDeviceRepository extends IDraxCrudRepository<IPushDevice, IPushDeviceBase, IPushDeviceBase>{

}

export {IPushDeviceRepository}


