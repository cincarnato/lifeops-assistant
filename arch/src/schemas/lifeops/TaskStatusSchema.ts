import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "TaskStatus",
    apiBasePath: "task-statuses",
    apiTag: "TaskStatus",
    collectionName: "TaskStatus",
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
