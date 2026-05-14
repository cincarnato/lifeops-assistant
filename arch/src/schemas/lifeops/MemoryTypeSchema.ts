import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "MemoryType",
    apiBasePath: "memory-types",
    apiTag: "MemoryType",
    collectionName: "MemoryType",
    schema: {
        name: {
            type: "string",
            required: true,
            search: true,
            header: true,
            index: true,
        },
        description: {
            type: "longString",
            required: true,
            search: true,
        },
    },
};

export default entitySchema;
export { entitySchema };
