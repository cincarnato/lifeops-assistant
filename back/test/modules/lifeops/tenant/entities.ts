export const tenantId = '507f1f77bcf86cd799439011';
export const otherTenantId = '507f1f77bcf86cd799439012';
export const userId = '507f1f77bcf86cd799439013';

// Explicit expectations keep a changed ownership control from silently updating the test.
export const operationalEntities = [
    {name: 'AgentJob', userField: 'createdBy', userControls: true},
    {name: 'AgentJobExecution', userField: 'user', userControls: false},
    {name: 'BusinessPartner', userField: 'user', userControls: true},
    {name: 'Contact', userField: 'user', userControls: true},
    {name: 'DayPlan', userField: 'user', userControls: true},
    {name: 'Delegate', userField: 'user', userControls: true},
    {name: 'Goal', userField: 'user', userControls: true},
    {name: 'Habit', userField: 'user', userControls: true},
    {name: 'HabitLog', userField: 'user', userControls: false},
    {name: 'Instruction', userField: 'user', userControls: false},
    {name: 'Memory', userField: 'user', userControls: true},
    {name: 'Project', userField: 'user', userControls: true},
    {name: 'Purpose', userField: 'user', userControls: true},
    {name: 'Service', userField: 'user', userControls: false},
    {name: 'ServiceTransaction', userField: 'user', userControls: false},
    {name: 'ShoppingItem', userField: 'user', userControls: true},
    {name: 'Task', userField: 'user', userControls: true},
    {name: 'TaskSchedule', userField: 'user', userControls: true},
] as const;

export const catalogEntities = [
    'TaskType', 'TaskStatus', 'Source', 'LifeArea', 'Priority', 'ContactType', 'MemoryType',
] as const;

export async function loadEntity(name: string) {
    // Load sequentially: Service/ServiceTransaction have circular factory imports.
    // Concurrent dynamic imports of those graphs can deadlock under Vite's module runner.
    const schemas = await import(`../../../../src/modules/lifeops/schemas/${name}Schema.ts`);
    const models = await import(`../../../../src/modules/lifeops/models/${name}Model.ts`);
    const mongo = await import(`../../../../src/modules/lifeops/repository/mongo/${name}MongoRepository.ts`);
    const sqlite = await import(`../../../../src/modules/lifeops/repository/sqlite/${name}SqliteRepository.ts`);
    const controllers = await import(`../../../../src/modules/lifeops/controllers/${name}Controller.ts`);
    const factories = await import(`../../../../src/modules/lifeops/factory/services/${name}ServiceFactory.ts`);
    return {
        input: schemas[`${name}BaseSchema`],
        output: schemas[`${name}Schema`],
        patch: schemas[`${name}PatchSchema`] ?? schemas[`${name}BaseSchema`].partial(),
        Model: models[`${name}Model`],
        MongoRepository: mongo.default,
        SqliteRepository: sqlite.default,
        Controller: controllers.default,
        factory: factories.default,
    };
}

export function populatePaths(fields: Array<string | {path: string}>): string[] {
    return fields.map(field => typeof field === 'string' ? field : field.path);
}
