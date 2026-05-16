import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "Purpose",
    apiBasePath: "purposes",
    apiTag: "Purpose",
    collectionName: "Purpose",
    schema: {
        title: {
            type: "string",
            required: true,
            search: true,
            header: true,
            index: true,
        },
        statement: {
            type: "longString",
            required: true,
            search: true,
        },
        isPrimary: {
            type: "boolean",
            default: false,
            header: true,
            index: true,
        },
        active: {
            type: "boolean",
            default: true,
            header: true,
            index: true,
        },
    },
};

export default entitySchema;
export { entitySchema };
