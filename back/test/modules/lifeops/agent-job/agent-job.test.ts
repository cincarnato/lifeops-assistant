import {afterAll, beforeAll, beforeEach, describe, expect, it} from "vitest"
import TestSetup from "../../../setup/TestSetup"
import {AgentJob} from "../../../../src/modules/lifeops/jobs/AgentJob"
import AgentJobServiceFactory from "../../../../src/modules/lifeops/factory/services/AgentJobServiceFactory"
import AgentJobExecutionServiceFactory from "../../../../src/modules/lifeops/factory/services/AgentJobExecutionServiceFactory"
import {AgentJobModel} from "../../../../src/modules/lifeops/models/AgentJobModel"
import {AgentJobExecutionModel} from "../../../../src/modules/lifeops/models/AgentJobExecutionModel"
import type {IAgentJob, IAgentJobBase} from "../../../../src/modules/lifeops/interfaces/IAgentJob"

describe("AgentJob", () => {
    const now = new Date("2026-11-05T12:00:00.000Z")
    let testSetup = new TestSetup()

    beforeAll(async () => {
        await testSetup.setup()
        await AgentJobModel.syncIndexes()
        await AgentJobExecutionModel.syncIndexes()
    })

    beforeEach(async () => {
        await AgentJobExecutionModel.deleteMany({})
        await AgentJobModel.deleteMany({})
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
    })

    it("runs only active due jobs using runtime.nextRunAt and updates runtime", async () => {
        const due = await createJob({runtime: {nextRunAt: now}})
        await createJob({
            name: "future",
            schedule: {
                type: "once",
                runAt: new Date("2026-11-06T12:00:00.000Z"),
                timezone: "America/Argentina/Buenos_Aires"
            }
        })
        await createJob({name: "inactive", active: false, runtime: {nextRunAt: now}})

        const agentJob = buildAgentJob()
        const result = await agentJob.runDueJobs({now, limit: 25})
        const updatedDue = await AgentJobModel.findById(due._id).lean().exec()

        expect(result.length).toBe(1)
        expect(result[0].job._id.toString()).toBe(due._id.toString())
        expect(await AgentJobExecutionModel.countDocuments()).toBe(1)
        expect(updatedDue?.runtime?.lastStatus).toBe("success")
        expect(updatedDue?.runtime?.nextRunAt?.toISOString()).toBe("2026-12-05T12:00:00.000Z")
    })

    it("does not run the same scheduled occurrence twice under concurrent workers", async () => {
        const job = await createJob({runtime: {nextRunAt: now}})
        let runnerCalls = 0
        const agentJob = buildAgentJob(async () => {
            runnerCalls += 1
            await new Promise(resolve => setTimeout(resolve, 50))
            return successOutput()
        })

        const [first, second] = await Promise.all([
            agentJob.executeJob(job, {trigger: "scheduled", scheduledFor: now}),
            agentJob.executeJob(job, {trigger: "scheduled", scheduledFor: now})
        ])

        expect(first._id.toString()).toBe(second._id.toString())
        expect(runnerCalls).toBe(1)
        expect(await AgentJobExecutionModel.countDocuments({jobId: job._id, scheduledFor: now, trigger: "scheduled"})).toBe(1)
    })

    it("repairs runtime when an execution exists but runtime was not advanced", async () => {
        const job = await createJob({runtime: {nextRunAt: now}})
        await AgentJobExecutionModel.create({
            jobId: job._id,
            status: "success",
            trigger: "scheduled",
            scheduledFor: now,
            startedAt: now,
            finishedAt: now,
            attempt: 1,
            toolCalls: []
        })

        const agentJob = buildAgentJob()
        const execution = await agentJob.executeJob(job, {trigger: "scheduled", scheduledFor: now})
        const updatedJob = await AgentJobModel.findById(job._id).lean().exec()

        expect(execution.status).toBe("success")
        expect(updatedJob?.runtime?.lastStatus).toBe("success")
        expect(updatedJob?.runtime?.nextRunAt?.toISOString()).toBe("2026-12-05T12:00:00.000Z")
    })

    function buildAgentJob(runner = async () => successOutput()) {
        return new AgentJob(
            AgentJobServiceFactory.instance,
            AgentJobExecutionServiceFactory.instance,
            runner as any
        )
    }

    async function createJob(overrides: Partial<IAgentJobBase> = {}): Promise<IAgentJob> {
        return AgentJobServiceFactory.instance.create({
            name: "Monthly agent job",
            active: true,
            agent: {
                systemPrompt: "Do the scheduled work",
                allowedTools: []
            },
            schedule: {
                type: "monthly",
                daysOfMonth: [5],
                time: "09:00",
                timezone: "America/Argentina/Buenos_Aires"
            },
            execution: {
                timeoutSeconds: 30,
                maxRetries: 0
            },
            createdBy: testSetup.rootUser._id,
            ...overrides
        })
    }

    function successOutput() {
        return {
            message: "ok",
            output: {ok: true},
            inputTokens: 1,
            outputTokens: 1,
            tokens: 2
        }
    }
})
