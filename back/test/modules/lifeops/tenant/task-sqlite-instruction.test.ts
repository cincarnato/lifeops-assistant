import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {AbstractSqliteRepository} from '@drax/crud-back';
import TaskSqliteRepository from '../../../../src/modules/lifeops/repository/sqlite/TaskSqliteRepository.js';
import InstructionServiceFactory from '../../../../src/modules/lifeops/factory/services/InstructionServiceFactory.js';
import {TaskSchema} from '../../../../src/modules/lifeops/schemas/TaskSchema.js';
import {tenantId} from './entities.js';

const instructionId = '507f1f77bcf86cd799439014';
const instruction = {_id: instructionId, title: 'Instructions', content: 'Steps', tenant: tenantId};
const populated = {...instruction, tenant: {_id: tenantId, name: 'Tenant A'}};
const output = TaskSchema.pick({instruction: true});

describe('Task SQLite nested instruction tenant', () => {
    let repository: TaskSqliteRepository;
    let db: any;
    const findById = vi.fn();

    beforeEach(() => {
        repository = new TaskSqliteRepository(':memory:', false);
        db = (repository as any).db;
        db.exec('CREATE TABLE Instruction (_id TEXT PRIMARY KEY, title TEXT, content TEXT, tenant TEXT)');
        db.prepare('INSERT INTO Instruction VALUES (?, ?, ?, ?)')
            .run(instruction._id, instruction.title, instruction.content, instruction.tenant);
        findById.mockReset().mockResolvedValue(populated);
        vi.spyOn(InstructionServiceFactory, 'instance', 'get').mockReturnValue({findById} as any);
    });

    afterEach(() => {
        db?.close();
        vi.restoreAllMocks();
    });

    it('needs recursive population: the base SQLite decorator leaves an invalid raw tenant ID', async () => {
        const task = {instruction: instructionId};
        await AbstractSqliteRepository.prototype.decorate.call(repository, task);
        expect(task.instruction).toEqual(instruction);
        expect(output.safeParse(task).success).toBe(false);
        expect(findById).not.toHaveBeenCalled();
    });

    it('uses the Instruction service to satisfy Task output validation with populated tenant', async () => {
        const task = {instruction: instructionId};
        await repository.decorate(task);
        expect(findById).toHaveBeenCalledExactlyOnceWith(instructionId);
        expect(output.parse(task)).toEqual({instruction: populated});
    });

    it.each([{}, {instruction: null}])('does not resolve an absent instruction: %j', async task => {
        await repository.decorate(task);
        expect(findById).not.toHaveBeenCalled();
        expect(output.safeParse(task).success).toBe(true);
    });
});
