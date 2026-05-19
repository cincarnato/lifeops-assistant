
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IPushDeviceRepository} from '../../interfaces/IPushDeviceRepository'
import type {IPushDevice, IPushDeviceBase} from "../../interfaces/IPushDevice";
import {SqliteTableField} from "@drax/common-back";

class PushDeviceSqliteRepository extends AbstractSqliteRepository<IPushDevice, IPushDeviceBase, IPushDeviceBase> implements IPushDeviceRepository {

    protected db: any;
    protected tableName: string = 'PushDevice';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['token', 'deviceName'];
    protected booleanFields: string[] = ['enabled'];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "platform", type: "TEXT", unique: undefined, primary: false},
{name: "token", type: "TEXT", unique: true, primary: false},
{name: "deviceName", type: "TEXT", unique: undefined, primary: false},
{name: "enabled", type: "TEXT", unique: undefined, primary: false},
{name: "lastSeenAt", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default PushDeviceSqliteRepository
export {PushDeviceSqliteRepository}

