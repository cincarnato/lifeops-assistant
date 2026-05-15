import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "Memory",
    apiBasePath: "memories",
    apiTag: "Memory",
    collectionName: "Memory",
    schema: {
        title: {
            type: "string",
            required: true,
            search: true,
            header: true,
            index: true,
        },
        content: {
            type: "longString",
            required: true,
            search: true,
        },
        type: {
            type: "string",
            required: true,
            search: true,
            header: true,
            index: true,
        },
        tags: {
            type: "array.string",
            default: [],
            index: true,
        },
        priority: {
            type: "string",
            default: "",
            header: true,
            index: true,
        },
        source: {
            type: "string",
            default: "manual",
            header: true,
            index: true,
        },
    },
};

export default entitySchema;
export { entitySchema };
