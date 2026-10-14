import {IEntitySchema} from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "Instruction",
    apiBasePath: "instructions",
    apiTag: "Instruction",
    collectionName: "Instruction",
    schema: {
        title: {type: "string", required: true, search: true, header: true},
        content: {type: "longString", required: true},
    },
};

export default entitySchema;
export {entitySchema};
