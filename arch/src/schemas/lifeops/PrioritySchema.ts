import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "Priority",
    apiBasePath: "priorities",
    apiTag: "Priority",
    collectionName: "Priority",
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
        color: {
            type: "string",
            required: true,
            search: true,
            header: true,
        },
    },
};

export default entitySchema;
export { entitySchema };
