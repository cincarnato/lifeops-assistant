import {describe, expect, it} from "vitest"
import {ProjectBaseSchema, ProjectSchema} from "../../../../src/modules/lifeops/schemas/ProjectSchema"
import {BusinessPartnerBaseSchema, BusinessPartnerSchema} from "../../../../src/modules/lifeops/schemas/BusinessPartnerSchema"
import {ProjectModel} from "../../../../src/modules/lifeops/models/ProjectModel"
import {BusinessPartnerModel} from "../../../../src/modules/lifeops/models/BusinessPartnerModel"

const removedProjectFields = ["goals", "priorityScore", "startDate", "targetDate", "completedAt", "progressPercent"]

describe("Project and BusinessPartner entity contracts", () => {
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
            goals: ["goal-id"], priorityScore: 9, startDate: "2026-01-01",
            targetDate: "2026-02-01", completedAt: "2026-02-01", progressPercent: 100
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
