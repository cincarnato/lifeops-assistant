import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "google",
    name: "GoogleConnection",
    apiBasePath: "google-connections",
    apiTag: "GoogleConnection",
    collectionName: "GoogleConnection",
    schema: {
        userId: {
            type: "ref",
            ref: "User",
            refDisplay: "email",
            required: true,
            index: true,
            header: true,
        },
        provider: {
            type: "enum",
            enum: ["google"],
            required: true,
            default: "google",
            index: true,
            header: true,
        },
        googleEmail: {
            type: "string",
            required: true,
            search: true,
            index: true,
            header: true,
        },
        googleUserId: {
            type: "string",
            required: true,
            search: true,
            unique: true,
            index: true,
            header: true,
        },
        accessToken: {
            type: "longString",
            required: false,
        },
        refreshToken: {
            type: "longString",
            required: true,
        },
        scope: {
            type: "array.string",
            required: true,
        },
        expiryDate: {
            type: "date",
            required: true,
            index: true,
            header: true,
        },
        status: {
            type: "enum",
            enum: ["active", "revoked", "error"],
            required: true,
            default: "active",
            index: true,
            header: true,
        },
        lastUsedAt: {
            type: "date",
            required: false,
            index: true,
            header: true,
        },
        connectedAt: {
            type: "date",
            required: true,
            index: true,
            header: true,
        },
    },
};

export default entitySchema;
export { entitySchema };
