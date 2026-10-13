import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "ShoppingItem",
    apiBasePath: "shopping-items",
    apiTag: "ShoppingItem",
    collectionName: "ShoppingItem",
    schema: {
        name: { type: "string", required: true, search: true, header: true },
        quantity: { type: "string", default: null, header: true },
        purchased: { type: "boolean", default: false, header: true },
        purchasedAt: { type: "date", default: null, header: true },
        user: { type: "ref", ref: "User", refDisplay: "username", required: true },
    },
};

export default entitySchema;
export { entitySchema };
