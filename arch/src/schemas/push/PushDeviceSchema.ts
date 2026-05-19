import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "push",
    name: "PushDevice",
    apiBasePath: "push-devices",
    apiTag: "PushDevice",
    collectionName: "PushDevice",
    schema: {
        user: {
            type: "ref",
            ref: "User",
            refDisplay: "username",
            required: true,
            index: true,
            header: true,
        },
        platform: {
            type: "enum",
            enum: ["android", "ios", "web"],
            required: true,
            index: true,
            header: true,
        },
        token: {
            type: "string",
            required: true,
            unique: true,
            search: true,
            index: true,
            header: true,
        },
        deviceName: {
            type: "string",
            search: true,
            header: true,
        },
        enabled: {
            type: "boolean",
            required: true,
            default: true,
            index: true,
            header: true,
        },
        lastSeenAt: {
            type: "date",
            index: true,
            header: true,
        },
    },
};

export default entitySchema;
export { entitySchema };
