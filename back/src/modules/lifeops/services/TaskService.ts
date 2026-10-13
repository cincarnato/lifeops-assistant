
import type{ITaskRepository} from "../interfaces/ITaskRepository";
import type {ITaskBase, ITask, ITaskNote} from "../interfaces/ITask";
import {AbstractService} from "@drax/crud-back";
import type {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import type {ZodObject, ZodRawShape} from "zod";
import TaskStatusServiceFactory from "../factory/services/TaskStatusServiceFactory.js";
import DelegateServiceFactory from '../factory/services/DelegateServiceFactory.js';
import {ValidationError} from '@drax/common-back';

class TaskService extends AbstractService<ITask, ITaskBase, ITaskBase> {

    async migrateBusinessPartnerReference(): Promise<void> {
        await (this._repository as ITaskRepository).migrateBusinessPartnerReference?.()
    }


    constructor(TaskRepository: ITaskRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TaskRepository, baseSchema, fullSchema);

        this._validateOutput = true
        this.transformCreate = async data => {
            await this.prepareDelegation(data)
            data.delegable ??= false
            data.notes = this.normalizeNotes(data.notes)
            return this.applyStatusAutomations(data)
        }
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

    async paginateArchived(options: IDraxPaginateOptions): Promise<IDraxPaginateResult<ITask>> {
        if (!this.repository.paginateArchived) {
            throw new Error("task.archive.repositoryUnsupported")
        }

        const pagination = await this.repository.paginateArchived(options)

        if (this.transformRead) {
            pagination.items = await Promise.all(pagination.items.map(item => this.transformRead(item)))
        }

        return pagination
    }

    async findPendingArchiveBatch(cutoff: Date, limit: number): Promise<ITask[]> {
        if (!this.repository.findPendingArchiveBatch) {
            throw new Error("task.archive.repositoryUnsupported")
        }

        return this.repository.findPendingArchiveBatch(cutoff, limit)
    }

    async archiveTask(task: ITask, migratedAt?: Date): Promise<void> {
        if (!this.repository.archiveTask) {
            throw new Error("task.archive.repositoryUnsupported")
        }

        await this.repository.archiveTask(task, migratedAt)
    }

    async findByScheduleOccurrence(taskScheduleId: string, scheduledFor: Date): Promise<ITask | null> {
        if (!this.repository.findByScheduleOccurrence) {
            throw new Error("task.scheduleOccurrence.repositoryUnsupported")
        }

        const task = await this.repository.findByScheduleOccurrence(taskScheduleId, scheduledFor)
        return task && this.transformRead ? this.transformRead(task) : task
    }

    private get repository(): ITaskRepository {
        return this._repository as ITaskRepository
    }

    private async applyStatusAutomations(data: ITaskBase): Promise<ITaskBase> {
        this.removeEmptyScheduleMetadata(data)

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

    private removeEmptyScheduleMetadata(data: ITaskBase): void {
        if (data.taskSchedule == null) {
            delete data.taskSchedule
        }
        if (data.scheduledFor == null) {
            delete data.scheduledFor
        }
    }

    private async prepareUpdateData(id: string, data: ITaskBase): Promise<ITaskBase> {
        this.removeScheduleMetadata(data)

        const previousTask = await this.findById(id)
        await this.prepareDelegation(data, previousTask)

        if (data.notes !== undefined) {
            data.notes = this.normalizeNotes(data.notes, previousTask?.notes)
        }
        this.applyStatusHistory(data, previousTask)

        return data
    }

    private removeScheduleMetadata(data: ITaskBase): void {
        delete data.taskSchedule
        delete data.scheduledFor
    }

    private async prepareDelegation(data: ITaskBase, previousTask?: ITask | null): Promise<void> {
        if (data.delegable === false) {
            data.delegate = null
            return
        }

        if (!data.delegate) {
            return
        }

        if ((data.delegable ?? previousTask?.delegable) !== true) {
            throw new ValidationError([{field: 'delegate', reason: 'task.delegation.requiresDelegable'}])
        }

        const delegate = await DelegateServiceFactory.instance.findById(data.delegate)
        const user = previousTask?.user ?? data.user
        if (!delegate?.active || String(delegate.user?._id ?? delegate.user) !== String(user?._id ?? user)) {
            throw new ValidationError([{field: 'delegate', reason: 'task.delegation.invalidDelegate'}])
        }
    }

    private applyStatusHistory(data: ITaskBase, previousTask: ITask | null): void {
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
        data.notes = Array.isArray(data.notes)
            ? data.notes.map(note => this.normalizeNote(note))
            : typeof data.notes === 'string' && data.notes.trim()
                ? [{note: data.notes.trim()}]
                : []
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
            return notes.map(note => {
                const normalizedNote = this.normalizeNote(note)
                const previousNote = normalizedPreviousNotes.find(previous =>
                    previous.note === normalizedNote.note &&
                    previous.date?.getTime() === normalizedNote.date?.getTime()
                )

                return {
                    note: normalizedNote.note,
                    date: previousNote?.date ?? new Date()
                }
            })
        }

        return normalizedPreviousNotes
    }

    private normalizeNote(note: any): ITaskNote {
        return {
            date: note?.date ? new Date(note.date) : undefined,
            note: note?.note ?? ''
        }
    }

}

export default TaskService
export {TaskService}
