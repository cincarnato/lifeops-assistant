
import type{ITaskRepository} from "../interfaces/ITaskRepository";
import type {ITaskBase, ITask, ITaskNote} from "../interfaces/ITask";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import TaskStatusServiceFactory from "../factory/services/TaskStatusServiceFactory.js";

class TaskService extends AbstractService<ITask, ITaskBase, ITaskBase> {


    constructor(TaskRepository: ITaskRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TaskRepository, baseSchema, fullSchema);

        this._validateOutput = true
        this.transformCreate = this.applyStatusAutomations.bind(this)
        this.transformUpdate = this.applyStatusAutomations.bind(this)
        this.transformUpdatePartial = this.applyStatusAutomations.bind(this)
        this.transformRead = this.normalizeTaskRead.bind(this)

    }

    async update(id: string, data: ITaskBase): Promise<ITask> {
        data = await this.prepareUpdateData(id, data)
        return super.update(id, data)
    }

    async updatePartial(id: string, data: any): Promise<ITask> {
        data = await this.prepareUpdateData(id, data)
        return super.updatePartial(id, data)
    }

    private async applyStatusAutomations(data: ITaskBase): Promise<ITaskBase> {
        data.notes = this.normalizeNotes(data.notes)

        if (!data.status) {
            return data
        }

        const status = await TaskStatusServiceFactory.instance.findOneBy('name', data.status)

        if (status?.completesTask) {
            data.completedAt = new Date()
        }

        if (status?.archivesTask) {
            data.archivedAt = new Date()
        }

        return data
    }

    private async prepareUpdateData(id: string, data: ITaskBase): Promise<ITaskBase> {
        const previousTask = await this.findById(id)

        data.notes = this.normalizeNotes(data.notes, previousTask?.notes)
        this.applyStatusHistory(data, previousTask)

        return data
    }

    private applyStatusHistory(data: ITaskBase, previousTask: ITask | null): void {

        console.log("applyStatusHistory",data, previousTask)

        if (!previousTask || !Object.prototype.hasOwnProperty.call(data, 'status')) {
            return
        }

        const previousStatus = previousTask.status ?? null
        const newStatus = data.status ?? null



        if (previousStatus === newStatus) {
            return
        }

        data.statusHistory = [
            ...(Array.isArray(previousTask.statusHistory) ? previousTask.statusHistory : []),
            {
                date: new Date(),
                previousStatus,
                newStatus
            }
        ]
    }

    private normalizeTaskRead(data: ITask): Promise<ITask> {
        data.notes = this.normalizeNotes(data.notes)
        data.statusHistory = Array.isArray(data.statusHistory) ? data.statusHistory : []
        return Promise.resolve(data)
    }

    private normalizeNotes(notes: ITaskBase['notes'], previousNotes?: ITaskBase['notes']): ITaskNote[] {
        const normalizedPreviousNotes = Array.isArray(previousNotes)
            ? previousNotes.map(note => this.normalizeNote(note))
            : []

        if (notes === undefined) {
            return normalizedPreviousNotes
        }

        if (notes === null) {
            return []
        }

        if (typeof notes === 'string') {
            const note = notes.trim()
            return note ? [...normalizedPreviousNotes, {date: new Date(), note}] : normalizedPreviousNotes
        }

        if (Array.isArray(notes)) {
            return notes.map(note => this.normalizeNote(note))
        }

        return normalizedPreviousNotes
    }

    private normalizeNote(note: any): ITaskNote {
        return {
            date: note?.date ? new Date(note.date) : new Date(),
            note: note?.note ?? ''
        }
    }

}

export default TaskService
export {TaskService}
