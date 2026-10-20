import {describe, expect, it} from "vitest"
import {ProjectBaseSchema, ProjectSchema} from "../../../../src/modules/lifeops/schemas/ProjectSchema"
import {BusinessPartnerBaseSchema, BusinessPartnerSchema} from "../../../../src/modules/lifeops/schemas/BusinessPartnerSchema"
import {ProjectModel} from "../../../../src/modules/lifeops/models/ProjectModel"
import {BusinessPartnerModel} from "../../../../src/modules/lifeops/models/BusinessPartnerModel"

const removedProjectFields = ["priorityScore", "startDate", "targetDate", "completedAt", "progressPercent", "valueScore", "motivationScore", "effortScore"]

describe("Project and BusinessPartner entity contracts", () => {
    it.each(['HIGH', 'MEDIUM', 'LOW', null, undefined])("accepts importance %s in Project inputs, outputs and Mongo documents", importance => {
        const input = {name: "Project", user: "507f1f77bcf86cd799439011", importance}
        const output = {...input, _id: "project-id", user: {_id: input.user, username: "User"}}

        expect(ProjectBaseSchema.parse(input).importance).toBe(importance)
        expect(ProjectSchema.parse(output).importance).toBe(importance)
        const project = new ProjectModel(input)
        expect(project.validateSync()).toBeUndefined()
        expect(project.importance).toBe(importance)
    })

    it.each(['URGENT', '', 1])("rejects invalid Project importance %s", importance => {
        const input = {name: "Project", user: "507f1f77bcf86cd799439011", importance}
        const output = {...input, _id: "project-id", user: {_id: input.user, username: "User"}}

        expect(ProjectBaseSchema.safeParse(input).success).toBe(false)
        expect(ProjectSchema.safeParse(output).success).toBe(false)
        expect(new ProjectModel(input).validateSync()?.errors.importance).toBeDefined()
    })

    it("does not default Project importance and preserves PATCH omission and clearing", () => {
        const input = {name: "Project", user: "user-id"}
        expect(ProjectBaseSchema.parse(input)).not.toHaveProperty("importance")
        expect(new ProjectModel(input).toObject()).not.toHaveProperty("importance")
        expect(ProjectBaseSchema.partial().parse({name: "Renamed"})).not.toHaveProperty("importance")
        expect(ProjectBaseSchema.partial().parse({importance: null})).toHaveProperty("importance", null)
        expect(ProjectModel.schema.path("importance").options.enum).toEqual(['HIGH', 'MEDIUM', 'LOW'])
    })

    it("accepts goal ids in inputs and populated goals in outputs without injecting them into PATCH", () => {
        const input = {name: "Project", user: "user-id", goals: ["goal-id"]}
        const goals = [{_id: "goal-id", name: "Goal"}]
        const output = {...input, _id: "project-id", user: {_id: "user-id", username: "User"}, goals}

        expect(ProjectBaseSchema.parse(input).goals).toEqual(["goal-id"])
        expect(ProjectSchema.parse(output).goals).toEqual(goals)
        expect(ProjectBaseSchema.partial().parse({name: "Renamed"})).not.toHaveProperty("goals")
        expect(ProjectBaseSchema.partial().parse({goals: []}).goals).toEqual([])
        expect(ProjectBaseSchema.safeParse({...input, goals: null}).success).toBe(false)
        expect(ProjectSchema.safeParse({...output, goals: ["goal-id"]}).success).toBe(false)
        expect(ProjectModel.schema.path("goals").options.type[0].ref).toBe("Goal")
    })

    it("accepts an optional string Redmine project id in inputs and outputs without a default", () => {
        const input = {name: "Project", user: "user-id"}
        const output = {...input, _id: "project-id", user: {_id: "user-id", username: "User"}}

        for (const [schema, data] of [[ProjectBaseSchema, input], [ProjectSchema, output]] as const) {
            expect(schema.parse(data)).not.toHaveProperty("redmineProjectId")
            expect(schema.parse({...data, redmineProjectId: "123"})).toHaveProperty("redmineProjectId", "123")
            expect(schema.safeParse({...data, redmineProjectId: 123}).success).toBe(false)
            expect(schema.safeParse({...data, redmineProjectId: null}).success).toBe(false)
        }
    })

    it("does not inject a Redmine project id into partial updates", () => {
        expect(ProjectBaseSchema.partial().parse({name: "Renamed"})).not.toHaveProperty("redmineProjectId")
        expect(ProjectBaseSchema.partial().parse({redmineProjectId: "new-id"})).toHaveProperty("redmineProjectId", "new-id")
    })

    it("removes obsolete Project fields from input and output contracts", () => {
        const legacyFields = {
            priorityScore: 9, startDate: "2026-01-01",
            targetDate: "2026-02-01", completedAt: "2026-02-01", progressPercent: 100,
            valueScore: 8, motivationScore: 7, effortScore: 6
        }
        const input = {name: "Project", user: "user-id", ...legacyFields}
        const output = {...input, _id: "project-id", user: {_id: "user-id", username: "User"}}

        for (const [schema, data] of [[ProjectBaseSchema, input], [ProjectSchema, output]] as const) {
            const parsed = schema.parse(data)
            for (const field of removedProjectFields) {
                expect(schema.shape).not.toHaveProperty(field)
                expect(parsed).not.toHaveProperty(field)
            }
        }
    })

    it("removes Redmine project ids from BusinessPartner input and output contracts", () => {
        const input = {name: "Partner", roles: ["client"], user: "user-id", redmineProjectIds: ["123"]}
        const output = {...input, _id: "partner-id", user: {_id: "user-id", username: "User"}}

        for (const [schema, data] of [[BusinessPartnerBaseSchema, input], [BusinessPartnerSchema, output]] as const) {
            expect(schema.shape).not.toHaveProperty("redmineProjectIds")
            expect(schema.parse(data)).not.toHaveProperty("redmineProjectIds")
        }
    })

    it("preserves provider payment details in inputs, outputs and Mongo documents", () => {
        const paymentDetails = {
            bankCbu: "0000003100012345678901",
            bankAlias: "provider.bank.alias",
            bankAccount: "001-000123/4",
            bankName: "Example Bank",
            paymentReceiptEmail: "payments@example.com",
            paymentReceiptUrl: "https://example.com/receipts"
        }
        const input = {name: "Provider", roles: ["provider"], user: "507f1f77bcf86cd799439011", ...paymentDetails}
        const output = {...input, _id: "partner-id", user: {_id: input.user, username: "User"}}

        expect(BusinessPartnerBaseSchema.parse(input)).toMatchObject(paymentDetails)
        expect(BusinessPartnerSchema.parse(output)).toMatchObject(paymentDetails)
        const partner = new BusinessPartnerModel(input)
        expect(partner.validateSync()).toBeUndefined()
        expect(partner.toObject()).toMatchObject(paymentDetails)
    })

    it.each(['bankCbu', 'bankAlias', 'bankAccount', 'bankName', 'paymentReceiptEmail', 'paymentReceiptUrl'] as const)(
        "keeps %s optional, string-valued and absent from unrelated partial updates",
        field => {
            const input = {name: "Partner", user: "user-id"}
            const output = {...input, _id: "partner-id", user: {_id: input.user, username: "User"}}

            for (const [schema, data] of [[BusinessPartnerBaseSchema, input], [BusinessPartnerSchema, output]] as const) {
                expect(schema.safeParse({...data, [field]: 123}).success).toBe(false)
            }
            expect(BusinessPartnerBaseSchema.parse(input)).not.toHaveProperty(field)
            expect(BusinessPartnerSchema.parse(output)).toHaveProperty(field, '')
            expect(new BusinessPartnerModel(input).toObject()).toHaveProperty(field, '')
            expect(BusinessPartnerBaseSchema.partial().parse({name: "Renamed"})).not.toHaveProperty(field)
            expect(BusinessPartnerBaseSchema.partial().parse({[field]: ""})).toHaveProperty(field, "")
        }
    )

    it("matches the new contracts in Mongo models", () => {
        for (const field of removedProjectFields) {
            expect(ProjectModel.schema.path(field)).toBeUndefined()
        }
        expect(ProjectModel.schema.path("redmineProjectId").instance).toBe("String")
        expect(ProjectModel.schema.path("redmineProjectId").options.required).toBe(false)
        expect(new ProjectModel({name: "Project"}).toObject()).not.toHaveProperty("redmineProjectId")
        expect(BusinessPartnerModel.schema.path("redmineProjectIds")).toBeUndefined()
    })
})
