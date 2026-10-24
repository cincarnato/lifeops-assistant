import {afterAll, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {mongoose} from '@drax/common-back';
import {TaskArchivedModel} from '../../../../src/modules/lifeops/models/TaskArchivedModel.js';
import {
    catalogEntities, loadEntity, operationalEntities, otherTenantId, populatePaths, tenantId, userId,
} from './entities.js';

type Entity = Awaited<ReturnType<typeof loadEntity>>;
const populatedTenant = {_id: tenantId, name: 'Tenant A'};

function createRbac() {
    return {
        tenantId,
        userId,
        hasTenant: true,
        hasSomePermission: vi.fn(() => false),
        assertPermission: vi.fn(),
        assertOrPermissions: vi.fn(),
        assertUserId: vi.fn((id: string) => {
            if (id !== userId) throw new Error('wrong user');
        }),
        assertTenantId: vi.fn((id: string) => {
            if (id !== tenantId) throw new Error('wrong tenant');
        }),
    };
}

describe('LifeOps tenant coverage', () => {
    it('covers exactly 18 operational entities and seven disjoint catalogs', () => {
        expect(operationalEntities).toHaveLength(18);
        expect(catalogEntities).toHaveLength(7);
        expect(new Set([...operationalEntities.map(entity => entity.name), ...catalogEntities]).size).toBe(25);
    });

    it('preserves the tenant contract in archived Tasks through the shared model', () => {
        const tenant = TaskArchivedModel.schema.path('tenant');
        expect(tenant.instance).toBe('ObjectId');
        expect(tenant.options).toMatchObject({ref: 'Tenant', required: false, index: true});
        expect(new TaskArchivedModel({tenant: tenantId}).get('tenant').toString()).toBe(tenantId);
        expect(new TaskArchivedModel().toObject()).not.toHaveProperty('tenant');
    });
});

for (const spec of operationalEntities) {
    describe(`${spec.name} tenant contracts`, () => {
        let entity: Entity;
        let mongo: any;
        let sqlite: any;
        let controller: any;
        let factorySpy: ReturnType<typeof vi.spyOn>;
        const service = {
            findById: vi.fn(),
            update: vi.fn(),
            updatePartial: vi.fn(),
        };

        beforeAll(async () => {
            entity = await loadEntity(spec.name);
            mongo = new entity.MongoRepository();
            // No build or seed is needed to inspect repository column/populate contracts.
            sqlite = new entity.SqliteRepository(':memory:', false);
            factorySpy = vi.spyOn(entity.factory, 'instance', 'get').mockReturnValue(service);
            controller = new entity.Controller();
            vi.spyOn(controller, 'onUpdated').mockImplementation(() => {});
            vi.spyOn(controller, 'handleError').mockImplementation((error: unknown) => { throw error; });
        });

        beforeEach(() => {
            vi.clearAllMocks();
            service.findById.mockResolvedValue({
                _id: 'item-id', tenant: populatedTenant, [spec.userField]: {_id: userId},
            });
            service.update.mockImplementation(async (_id, data) => data);
            service.updatePartial.mockImplementation(async (_id, data) => data);
        });

        afterAll(() => {
            sqlite?.db.close();
            factorySpy?.mockRestore();
        });

        it('accepts an input tenant ID, null or omission without a default', () => {
            const input = entity.input.pick({tenant: true});
            expect(input.parse({tenant: tenantId})).toEqual({tenant: tenantId});
            expect(input.parse({tenant: null})).toEqual({tenant: null});
            expect(input.parse({})).toEqual({});
            expect(input.safeParse({tenant: populatedTenant}).success).toBe(false);
            expect(input.safeParse({tenant: 123}).success).toBe(false);
        });

        it('requires populated tenant output rather than a bare ID, and supports legacy absence', () => {
            const output = entity.output.pick({tenant: true});
            expect(output.parse({tenant: populatedTenant})).toEqual({tenant: populatedTenant});
            expect(output.parse({tenant: null})).toEqual({tenant: null});
            expect(output.parse({})).toEqual({});
            expect(output.safeParse({tenant: tenantId}).success).toBe(false);
            expect(output.safeParse({tenant: {_id: tenantId}}).success).toBe(false);
        });

        it('does not inject tenant into an empty or unrelated PATCH, and preserves explicit values', () => {
            expect(entity.patch.parse({})).not.toHaveProperty('tenant');
            // Use an existing field without relying on that field's required create shape.
            const field = Object.keys(entity.input.shape).find(key => key !== 'tenant')!;
            expect(entity.patch.parse({[field]: undefined})).not.toHaveProperty('tenant');
            expect(entity.patch.parse({tenant: tenantId})).toHaveProperty('tenant', tenantId);
            expect(entity.patch.parse({tenant: null})).toHaveProperty('tenant', null);
            expect(entity.patch.safeParse({tenant: populatedTenant}).success).toBe(false);
        });

        it('stores an optional indexed Mongo Tenant ObjectId without a default', () => {
            const tenant = entity.Model.schema.path('tenant');
            expect(tenant.instance).toBe('ObjectId');
            expect(tenant.options).toMatchObject({ref: 'Tenant', required: false, index: true});
            expect(tenant.defaultValue).toBeUndefined();
            expect(new entity.Model({tenant: tenantId}).get('tenant')).toBeInstanceOf(mongoose.Types.ObjectId);
            expect(new entity.Model({tenant: tenantId}).get('tenant').toString()).toBe(tenantId);
            expect(new entity.Model().toObject()).not.toHaveProperty('tenant');
            expect(() => tenant.cast('not-an-object-id')).toThrow(mongoose.Error.CastError);
        });

        it('populates tenant in Mongo and declares the matching SQLite column and relation', () => {
            expect(mongo._model).toBe(entity.Model);
            expect(populatePaths(mongo._populateFields).filter(path => path === 'tenant')).toHaveLength(1);
            expect(sqlite.tableFields.filter((field: {name: string}) => field.name === 'tenant')).toEqual([
                expect.objectContaining({name: 'tenant', type: 'TEXT', primary: false, unique: false}),
            ]);
            expect(sqlite.populateFields.filter((field: {field: string}) => field.field === 'tenant')).toEqual([
                {field: 'tenant', table: 'tenants', identifier: '_id'},
            ]);
        });

        it('enables all tenant controls and preserves the existing user controls', () => {
            expect(controller).toMatchObject({
                tenantField: 'tenant', tenantFilter: true, tenantSetter: true, tenantAssert: true,
                userField: spec.userField,
                userFilter: spec.userControls, userSetter: spec.userControls, userAssert: spec.userControls,
            });
        });

        it('adds tenant and the existing user constraint without dropping caller filters', () => {
            const filters = [{field: 'existing', operator: 'eq', value: 'kept'}];
            controller.applyUserAndTenantFilters(filters, createRbac());
            expect(filters).toEqual([
                {field: 'existing', operator: 'eq', value: 'kept'},
                {field: 'tenant', operator: 'eq', value: tenantId},
                ...(spec.userControls ? [{field: spec.userField, operator: 'eq', value: userId}] : []),
            ]);
        });

        it('retains tenant filtering even with broad user permissions', () => {
            const rbac = createRbac();
            rbac.hasSomePermission.mockReturnValue(true);
            const filters: unknown[] = [];
            controller.applyUserAndTenantFilters(filters, rbac);
            expect(filters).toEqual([{field: 'tenant', operator: 'eq', value: tenantId}]);
        });

        it('sets tenant from trusted RBAC before custom create hooks, retaining user setters', async () => {
            const payload = {tenant: otherTenantId};
            const prepared = await controller.prepareCreatePayload({rbac: createRbac()}, payload);
            expect(prepared).toHaveProperty('tenant', tenantId);
            if (spec.userControls) expect(prepared).toHaveProperty(spec.userField, userId);
            else expect(prepared).not.toHaveProperty(spec.userField);
        });

        it.each([tenantId, {_id: tenantId}, new mongoose.Types.ObjectId(tenantId)])(
            'asserts ownership for raw or populated tenant %j', tenant => {
                const rbac = createRbac();
                controller.assertTenant({tenant}, rbac);
                expect(rbac.assertTenantId).toHaveBeenCalledWith(tenantId);
            },
        );

        it.each([otherTenantId, {_id: otherTenantId}])('rejects another tenant %j', tenant => {
            expect(() => controller.assertTenant({tenant}, createRbac())).toThrow('wrong tenant');
        });

        it.each(['update', 'updatePartial'] as const)('%s cannot change tenant via the payload', async method => {
            const request = {params: {id: 'item-id'}, body: {tenant: otherTenantId}, rbac: createRbac()};
            await controller[method](request, {});
            expect(request.rbac.assertTenantId).toHaveBeenCalledWith(tenantId);
            expect(service[method]).toHaveBeenCalledWith('item-id', expect.not.objectContaining({tenant: expect.anything()}));
            expect(service[method].mock.calls[0][1]).not.toHaveProperty('tenant');
        });

        it.each(['update', 'updatePartial'] as const)('%s rejects cross-tenant access before calling the service', async method => {
            service.findById.mockResolvedValue({_id: 'item-id', tenant: otherTenantId, [spec.userField]: userId});
            const rbac = createRbac();
            // UpdateAll must not bypass the tenant assertion.
            rbac.hasSomePermission.mockReturnValue(true);
            await expect(controller[method]({params: {id: 'item-id'}, body: {}, rbac}, {})).rejects.toThrow('wrong tenant');
            expect(service[method]).not.toHaveBeenCalled();
        });
    });
}

for (const name of catalogEntities) {
    describe(`${name} remains a global catalog`, () => {
        let entity: Entity;
        let mongo: any;
        let sqlite: any;
        let controller: any;
        let factorySpy: ReturnType<typeof vi.spyOn>;

        beforeAll(async () => {
            entity = await loadEntity(name);
            mongo = new entity.MongoRepository();
            sqlite = new entity.SqliteRepository(':memory:', false);
            factorySpy = vi.spyOn(entity.factory, 'instance', 'get').mockReturnValue({});
            controller = new entity.Controller();
        });

        afterAll(() => {
            sqlite?.db.close();
            factorySpy?.mockRestore();
        });

        it('excludes tenant from input/output/PATCH schemas and the Mongo model', () => {
            for (const schema of [entity.input, entity.output, entity.patch]) {
                expect(schema.shape).not.toHaveProperty('tenant');
            }
            expect(entity.Model.schema.path('tenant')).toBeUndefined();
        });

        it('excludes tenant from Mongo populate and SQLite columns/relations', () => {
            expect(populatePaths(mongo._populateFields)).not.toContain('tenant');
            expect(sqlite.tableFields.some((field: {name: string}) => field.name === 'tenant')).toBe(false);
            expect(sqlite.populateFields.some((field: {field: string}) => field.field === 'tenant')).toBe(false);
        });

        it('leaves tenant and user controls disabled', () => {
            expect(controller).toMatchObject({
                tenantFilter: false, tenantSetter: false, tenantAssert: false,
                userFilter: false, userSetter: false, userAssert: false,
            });
            const filters: unknown[] = [];
            const payload = {};
            const rbac = createRbac();
            controller.applyUserAndTenantFilters(filters, rbac);
            controller.applyUserAndTenantSetters(payload, rbac);
            controller.assertTenant({tenant: otherTenantId}, rbac);
            expect(filters).toEqual([]);
            expect(payload).toEqual({});
            expect(rbac.assertTenantId).not.toHaveBeenCalled();
        });
    });
}
