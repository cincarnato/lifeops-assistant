import type {ITask} from "../interfaces/ITask.js";
import type {TaskService} from "../services/TaskService.js";

interface TaskArchiveJobOptions {
    archiveAfterHours?: number;
    batchSize?: number;
    now?: Date;
}

interface TaskArchiveJobResult {
    found: number;
    archived: number;
    failed: number;
}

const DEFAULT_TASK_ARCHIVE_JOB_OPTIONS: Required<Omit<TaskArchiveJobOptions, "now">> = {
    archiveAfterHours: 72,
    batchSize: 100
};

class TaskArchiveJob {
    constructor(private readonly taskService: TaskService) {
    }

    public async run(options: TaskArchiveJobOptions = {}): Promise<TaskArchiveJobResult> {
        const resolvedOptions = this.resolveOptions(options);
        const cutoff = new Date(resolvedOptions.now.getTime() - resolvedOptions.archiveAfterHours * 60 * 60 * 1000);
        const result: TaskArchiveJobResult = {
            found: 0,
            archived: 0,
            failed: 0
        };

        console.log("Task archive job started", {
            cutoff: cutoff.toISOString(),
            archiveAfterHours: resolvedOptions.archiveAfterHours,
            batchSize: resolvedOptions.batchSize
        });

        while (true) {
            const tasks = await this.taskService.findPendingArchiveBatch(cutoff, resolvedOptions.batchSize);
            result.found += tasks.length;

            console.log(`Found ${tasks.length} tasks to archive`);

            if (tasks.length === 0) {
                break;
            }

            const batchResult = await this.archiveBatch(tasks);
            result.archived += batchResult.archived;
            result.failed += batchResult.failed;

            console.log(`Archived ${batchResult.archived} tasks`);
            console.log(`Failed ${batchResult.failed} tasks`);

            if (tasks.length < resolvedOptions.batchSize || batchResult.failed > 0) {
                break;
            }
        }

        console.log("Task archive job finished", result);

        return result;
    }

    private async archiveBatch(tasks: ITask[]): Promise<Pick<TaskArchiveJobResult, "archived" | "failed">> {
        const result = {
            archived: 0,
            failed: 0
        };

        for (const task of tasks) {
            try {
                await this.taskService.archiveTask(task);
                result.archived += 1;
            } catch (error) {
                result.failed += 1;
                console.error("Task archive item failed", {
                    taskId: task._id,
                    name: (error as any)?.name,
                    message: (error as any)?.message,
                    stack: (error as any)?.stack
                });
            }
        }

        return result;
    }

    private resolveOptions(options: TaskArchiveJobOptions): Required<TaskArchiveJobOptions> {
        return {
            archiveAfterHours: options.archiveAfterHours ?? DEFAULT_TASK_ARCHIVE_JOB_OPTIONS.archiveAfterHours,
            batchSize: options.batchSize ?? DEFAULT_TASK_ARCHIVE_JOB_OPTIONS.batchSize,
            now: options.now ?? new Date()
        };
    }
}

export default TaskArchiveJob;
export {TaskArchiveJob, DEFAULT_TASK_ARCHIVE_JOB_OPTIONS};
export type {TaskArchiveJobOptions, TaskArchiveJobResult};
