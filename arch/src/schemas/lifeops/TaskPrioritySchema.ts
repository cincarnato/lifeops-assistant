import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "TaskPriority",
    apiBasePath: "task-priorities",
    apiTag: "TaskPriority",
    collectionName: "TaskPriority",
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
