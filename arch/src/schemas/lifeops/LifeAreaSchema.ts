import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "LifeArea",
    apiBasePath: "life-areas",
    apiTag: "LifeArea",
    collectionName: "LifeArea",
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
            required: false,
            search: true,
        },
    },
};

export default entitySchema;
export { entitySchema };
