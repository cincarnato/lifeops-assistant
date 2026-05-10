import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "Company",
    apiBasePath: "companies",
    apiTag: "Company",
    collectionName: "Company",
    schema: {
        name: {
            type: "string",
            required: true,
            search: true,
            header: true,
            index: true,
        },
        legalName: {
            type: "string",
            search: true,
        },
        taxIdType: {
            type: "string",
            search: true,
        },
        taxIdNumber: {
            type: "string",
            search: true,
        },
        description: {
            type: "longString",
            search: true,
        },
        type: {
            type: "enum",
            enum: [
                "company",
                "government",
                "non_profit",
                "internal",
                "partner",
                "provider",
                "other",
            ],
            default: "company",
            index: true,
            header: true,
        },
        status: {
            type: "enum",
            enum: ["active", "inactive", "archived"],
            default: "active",
            index: true,
            header: true,
        },
        website: {
            type: "string",
            search: true,
        },
        emailDomains: {
            type: "array.string",
            default: [],
            index: true,
        },
        tags: {
            type: "array.string",
            default: [],
            index: true,
        },
        notes: {
            type: "longString",
        },
        user: {
            type: "ref",
            ref: "User",
            refDisplay: "username",
            required: true,
            index: true,
            header: true,
        },
        archivedAt: {
            type: "date",
        },
    },
};

export default entitySchema;
export { entitySchema };
