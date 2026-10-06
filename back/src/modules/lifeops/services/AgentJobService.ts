import type{IAgentJobRepository} from "../interfaces/IAgentJobRepository";
import type {IAgentJobBase, IAgentJob} from "../interfaces/IAgentJob";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import {AgentJobScheduleCalculator} from "./AgentJobScheduleCalculator.js";

class AgentJobService extends AbstractService<IAgentJob, IAgentJobBase, IAgentJobBase> {
    private readonly calculator = new AgentJobScheduleCalculator()

    constructor(AgentJobRepository: IAgentJobRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(AgentJobRepository, baseSchema, fullSchema);

        this._validateOutput = true
        this.transformCreate = this.prepareWrite.bind(this)
        this.transformUpdate = this.prepareWrite.bind(this)
    }

    async updatePartial(id: string, data: any): Promise<IAgentJob> {
        const previous = await this.findById(id)
        if (!previous) {
            throw new Error("agent.job.notFound")
        }

        if (this.shouldRecalculateNextRunAt(data)) {
            const merged = this.mergeJob(previous, data)
            data.runtime = {
                ...(previous.runtime ?? {}),
                ...(data.runtime ?? {}),
                nextRunAt: merged.active === false ? previous.runtime?.nextRunAt : this.calculator.calculateNextRunAt(merged, new Date())
            }
        }

        return super.updatePartial(id, data)
    }

    async findDue(now: Date, limit: number): Promise<IAgentJob[]> {
        if (!this.repository.findDue) {
            throw new Error("agent.job.due.repositoryUnsupported")
        }

        return this.repository.findDue(now, limit)
    }

    private async prepareWrite(data: IAgentJobBase): Promise<IAgentJobBase> {
        if (!data.schedule) {
            return data
        }

        const active = data.active !== false
        return {
            ...data,
            active,
            runtime: {
                ...(data.runtime ?? {}),
                nextRunAt: active ? this.calculator.calculateNextRunAt(data, new Date()) : data.runtime?.nextRunAt
            }
        }
    }

    private shouldRecalculateNextRunAt(data: any): boolean {
        return ["schedule", "active"].some(field => Object.prototype.hasOwnProperty.call(data, field))
    }

    private mergeJob(previous: IAgentJob, data: any): IAgentJobBase {
        return {
            ...previous,
            ...data,
            agent: {
                ...previous.agent,
                ...(data.agent ?? {})
            },
            schedule: {
                ...previous.schedule,
                ...(data.schedule ?? {})
            },
            execution: {
                ...(previous.execution ?? {}),
                ...(data.execution ?? {})
            },
            runtime: {
                ...(previous.runtime ?? {}),
                ...(data.runtime ?? {})
            },
            createdBy: data.createdBy ?? previous.createdBy
        }
    }

    private get repository(): IAgentJobRepository {
        return this._repository as IAgentJobRepository
    }
}

export default AgentJobService
export {AgentJobService}
