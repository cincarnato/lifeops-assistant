import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "TaskSource",
    apiBasePath: "task-sources",
    apiTag: "TaskSource",
    collectionName: "TaskSource",
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
            search: true,
        },
    },
};

export default entitySchema;
export { entitySchema };
