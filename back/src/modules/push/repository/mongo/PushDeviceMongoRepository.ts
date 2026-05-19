
import {AbstractMongoRepository} from "@drax/crud-back";
import {PushDeviceModel} from "../../models/PushDeviceModel.js";
import type {IPushDeviceRepository} from '../../interfaces/IPushDeviceRepository'
import type {IPushDevice, IPushDeviceBase} from "../../interfaces/IPushDevice";


class PushDeviceMongoRepository extends AbstractMongoRepository<IPushDevice, IPushDeviceBase, IPushDeviceBase> implements IPushDeviceRepository {

    constructor() {
        super();
        this._model = PushDeviceModel;
        this._searchFields = ['token', 'deviceName'];
        this._populateFields = ['user'];
        this._lean = true
    }

}

export default PushDeviceMongoRepository
export {PushDeviceMongoRepository}

