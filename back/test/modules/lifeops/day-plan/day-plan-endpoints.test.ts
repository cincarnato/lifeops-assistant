import {afterAll, beforeAll, beforeEach, describe, expect, it} from "vitest"
import {mongoose} from "@drax/common-back"
import TestSetup from "../../../setup/TestSetup"
import DayPlanRoutes from "../../../../src/modules/lifeops/routes/DayPlanRoutes"
import DayPlanPermissions from "../../../../src/modules/lifeops/permissions/DayPlanPermissions"
import {DayPlanModel} from "../../../../src/modules/lifeops/models/DayPlanModel"

describe("DayPlan endpoints", () => {
    const testSetup = new TestSetup({
        routes: [DayPlanRoutes],
        permissions: [DayPlanPermissions]
    })

    beforeAll(async () => {
        await testSetup.setup()
        await DayPlanModel.syncIndexes()
    })

    beforeEach(async () => {
        await DayPlanModel.deleteMany({})
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
    })

    it("omits orphaned task references when paginating day plans", async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        const missingTaskId = new mongoose.Types.ObjectId()

        await DayPlanModel.create({
            date: new Date("2026-10-08T00:00:00.000Z"),
            user: testSetup.rootUser._id,
            status: "BORRADOR",
            tasks: [
                {
                    task: missingTaskId,
                    decision: "PENDIENTE"
                }
            ]
        })

        const response = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: "/api/day-plans?page=1&limit=10&orderBy=&order=asc&search=&filters=",
            headers: {Authorization: `Bearer ${accessToken}`}
        })

        expect(response.statusCode).toBe(200)
        expect(response.json().items[0].tasks).toEqual([])
    })
})
