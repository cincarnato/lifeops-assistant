import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "push",
    name: "PushMessage",
    apiBasePath: "push-messages",
    apiTag: "PushMessage",
    collectionName: "PushMessage",
    schema: {
        user: {
            type: "ref",
            ref: "User",
            refDisplay: "username",
            required: true,
            index: true,
            header: true,
        },
        title: {
            type: "string",
            required: true,
            search: true,
            header: true,
        },
        body: {
            type: "longString",
            required: true,
            search: true,
            header: true,
        },
        status: {
            type: "enum",
            enum: ["pending", "sent", "failed", "read"],
            required: true,
            default: "pending",
            index: true,
            header: true,
        },
        providerMessageId: {
            type: "string",
            search: true,
            index: true,
            header: true,
        },
        type: {
            type: "string",
            search: true,
            index: true,
            header: true,
        },
        errorMessage: {
            type: "longString",
            search: true,
        },
        sentAt: {
            type: "date",
            index: true,
            header: true,
        },
    },
};

export default entitySchema;
export { entitySchema };
