
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IInstructionRepository} from '../../interfaces/IInstructionRepository'
import type {IInstruction, IInstructionBase} from "../../interfaces/IInstruction";
import {SqliteTableField} from "@drax/common-back";

class InstructionSqliteRepository extends AbstractSqliteRepository<IInstruction, IInstructionBase, IInstructionBase> implements IInstructionRepository {

    protected db: any;
    protected tableName: string = 'Instruction';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['title'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        {field: 'tenant', table: 'tenants', identifier: '_id'},

    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: 'tenant', type: 'TEXT', primary: false, unique: false},
        {name: "title", type: "TEXT", unique: undefined, primary: false},
{name: "content", type: "TEXT", unique: undefined, primary: false}
    ]

}

export default InstructionSqliteRepository
export {InstructionSqliteRepository}
