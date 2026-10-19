import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { CreateOrUpdateRole, CreateUserIfNotExist } from '@drax/identity-back';
import { mongoose } from '@drax/common-back';
import type { DraxAgentPromptContext } from '@drax/ai-back';
import TestSetup from '../../../setup/TestSetup.js';
import ShoppingItemRoutes from '../../../../src/modules/lifeops/routes/ShoppingItemRoutes.js';
import ShoppingItemPermissions from '../../../../src/modules/lifeops/permissions/ShoppingItemPermissions.js';
import ShoppingItemServiceFactory from '../../../../src/modules/lifeops/factory/services/ShoppingItemServiceFactory.js';
import { ShoppingItemModel } from '../../../../src/modules/lifeops/models/ShoppingItemModel.js';
import { ShoppingItemBaseSchema } from '../../../../src/modules/lifeops/schemas/ShoppingItemSchema.js';
import AgentConfigService from '../../../../src/modules/lifeops/services/AgentConfigService.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ShoppingItemSqliteRepository from '../../../../src/modules/lifeops/repository/sqlite/ShoppingItemSqliteRepository.js';
import ShoppingItemService from '../../../../src/modules/lifeops/services/ShoppingItemService.js';

describe('Shopping item endpoints and AI tools', () => {
    const setup = new TestSetup({ routes: [ShoppingItemRoutes], permissions: [ShoppingItemPermissions] });
    let headers: { Authorization: string };

    beforeAll(async () => {
        await setup.setup();
        const { accessToken } = await setup.rootUserLogin();
        headers = { Authorization: `Bearer ${accessToken}` };
    });
    beforeEach(async () => { await ShoppingItemModel.deleteMany({}); });
    afterAll(async () => {
        await setup.fastifyInstance.close();
        await setup.dropAndClose();
    });

    async function create(payload = {}) {
        const response = await setup.fastifyInstance.inject({
            method: 'POST', url: '/api/shopping-items', headers, payload: { name: '  Leche  ', ...payload },
        });
        expect(response.statusCode, response.body).toBe(200);
        return response.json();
    }

    it('creates with trimmed name, defaults, authenticated ownership and creation date', async () => {
        const item = await create({ user: setup.basicUser._id, createdAt: '2000-01-01' });
        expect(item).toMatchObject({ name: 'Leche', quantity: null, purchased: false, purchasedAt: null });
        expect(item.user._id).toBe(setup.rootUser._id.toString());
        expect(new Date(item.createdAt).getTime()).toBeGreaterThan(Date.now() - 10000);
        const response = await setup.fastifyInstance.inject({ method: 'GET', url: `/api/shopping-items/${item._id}`, headers });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual(item);
    });

    it.each(['PUT', 'PATCH'] as const)('sets and preserves purchase date, then clears it when reopened with %s', async method => {
        const item = await create({ quantity: '2 litros' });
        const update = (payload: object) => setup.fastifyInstance.inject({
            method, url: `/api/shopping-items/${item._id}`, headers, payload,
        });
        const bought = await update({ purchased: true });
        expect(bought.statusCode, bought.body).toBe(200);
        const purchaseDate = bought.json().purchasedAt;
        expect(new Date(purchaseDate).getTime()).toBeGreaterThan(Date.now() - 10000);
        const repeated = await update({ purchased: true });
        expect(repeated.json().purchasedAt).toBe(purchaseDate);
        const edited = await update({ name: '  Leche entera  ', purchasedAt: '2000-01-01', createdAt: '2000-01-01' });
        expect(edited.statusCode, edited.body).toBe(200);
        expect(edited.json()).toMatchObject({ name: 'Leche entera', quantity: '2 litros', purchased: true,
            purchasedAt: purchaseDate, createdAt: item.createdAt });
        const reopened = await update({ purchased: false });
        expect(reopened.statusCode).toBe(200);
        expect(reopened.json()).toMatchObject({ purchased: false, purchasedAt: null });
        expect((await ShoppingItemServiceFactory.instance.findById(item._id))?.purchasedAt).toBeNull();
    });

    it('persists optional free text purchase location and preserves it on unrelated PATCH', async () => {
        const item = await create({ purchaseLocation: '  Mercado del barrio  ' });
        expect(item.purchaseLocation).toBe('Mercado del barrio');
        for (const payload of [{ purchased: true }, { purchaseLocation: '' }, { purchaseLocation: null }]) {
            const response = await setup.fastifyInstance.inject({ method: 'PATCH', url: `/api/shopping-items/${item._id}`, headers, payload });
            expect(response.statusCode, response.body).toBe(200);
            expect(response.json().purchaseLocation).toBe('purchaseLocation' in payload ? payload.purchaseLocation : 'Mercado del barrio');
        }
        expect(ShoppingItemBaseSchema.safeParse({ name: 'Pan', user: 'owner', purchaseLocation: 42 }).success).toBe(false);
    });

    it('purges all purchased items beyond pagination, ignoring client ownership and filters', async () => {
        await ShoppingItemModel.insertMany(Array.from({ length: 105 }, (_, i) => ({ name: `Bought ${i}`, user: setup.rootUser._id, purchased: true })));
        const pending = await create();
        const other = await ShoppingItemServiceFactory.instance.create({ name: 'Other', user: setup.basicUser._id, purchased: true });
        const response = await setup.fastifyInstance.inject({ method: 'DELETE',
            url: `/api/shopping-items/purchased?limit=1&page=2&user=${setup.basicUser._id}&filters=purchased;eq;false`, headers });
        expect(response.statusCode, response.body).toBe(200);
        expect(response.json()).toEqual({ deletedCount: 105 });
        expect(await ShoppingItemModel.countDocuments()).toBe(2);
        expect(await ShoppingItemServiceFactory.instance.findById(pending._id)).not.toBeNull();
        expect(await ShoppingItemServiceFactory.instance.findById(other._id)).not.toBeNull();
        const repeated = await setup.fastifyInstance.inject({ method: 'DELETE', url: '/api/shopping-items/purchased', headers });
        expect(repeated.json()).toEqual({ deletedCount: 0 });
    });

    it.each([ShoppingItemPermissions.Delete, ShoppingItemPermissions.Manage, ShoppingItemPermissions.View])('checks purge permission %s and isolates owners', async permission => {
        const roleName = `Purge${permission.split(':')[1]}`;
        await CreateOrUpdateRole({ name: roleName, permissions: [permission] });
        const user = await CreateUserIfNotExist({ active: true, username: roleName, name: roleName, email: `${permission.split(':')[1]}@purge.test`, password: 'PurgeTest123!', role: roleName });
        {
            const own = await ShoppingItemServiceFactory.instance.create({ name: 'Own', user: user._id, purchased: true });
            const other = await create({ purchased: true });
            const { accessToken } = await setup.login(roleName, 'PurgeTest123!');
            const response = await setup.fastifyInstance.inject({ method: 'DELETE', url: '/api/shopping-items/purchased', headers: { Authorization: `Bearer ${accessToken}` } });
            const allowed = permission !== ShoppingItemPermissions.View;
            expect(response.statusCode, response.body).toBe(allowed ? 200 : 403);
            if (allowed) expect(response.json()).toEqual({ deletedCount: 1 });
            expect(!!await ShoppingItemServiceFactory.instance.findById(own._id)).toBe(!allowed);
            expect(await ShoppingItemServiceFactory.instance.findById(other._id)).not.toBeNull();
        }
    });

    it('rejects anonymous purge without deleting anything', async () => {
        await create({ purchased: true });
        const response = await setup.fastifyInstance.inject({ method: 'DELETE', url: '/api/shopping-items/purchased' });
        expect(response.statusCode).toBe(401);
        expect(await ShoppingItemModel.countDocuments()).toBe(1);
    });

    it('does not inject defaults into partial schemas', () => {
        expect(ShoppingItemBaseSchema.partial().parse({ name: 'Pan' })).toEqual({ name: 'Pan' });
    });

    it('also persists defaults and purchase dates using the generated SQLite repository', async () => {
        const directory = mkdtempSync(join(tmpdir(), 'lifeops-shopping-'));
        const repository = new ShoppingItemSqliteRepository(join(directory, 'shopping.sqlite'));
        const database = (repository as any).db;
        try {
            repository.build();
            database.exec("CREATE TABLE user (_id TEXT PRIMARY KEY, username TEXT); INSERT INTO user VALUES ('owner', 'Owner')");
            const service = new ShoppingItemService(repository);
            const item = await service.create({ name: 'Pan', user: 'owner', purchaseLocation: 'Bakery' });
                        expect(item.purchaseLocation).toBe('Bakery');
            expect(item).toMatchObject({ quantity: null, purchased: false, purchasedAt: null });
            expect(item.createdAt).toBeInstanceOf(Date);
            const bought = await service.updatePartial(item._id, { purchased: true });
            expect(bought.purchasedAt).toBeInstanceOf(Date);
            const edited = await service.updatePartial(item._id, { quantity: '2 unidades' });
            expect(edited.purchasedAt).toEqual(bought.purchasedAt);
            expect(edited.createdAt).toEqual(item.createdAt);
            expect((await service.updatePartial(item._id, { purchased: false })).purchasedAt).toBeNull();
                        await service.create({ name: 'Bought', user: 'owner', purchased: true });
                        database.exec("INSERT INTO user VALUES ('other', 'Other')");
                        const other = await service.create({ name: 'Other', user: 'other', purchased: true });
                        expect(await service.purgePurchased('owner')).toEqual({ deletedCount: 1 });
                        expect(await service.purgePurchased('owner')).toEqual({ deletedCount: 0 });
                        expect(await service.findById(item._id)).not.toBeNull();
                        expect(await service.findById(other._id)).not.toBeNull();
        } finally {
            database.close();
            rmSync(directory, { recursive: true, force: true });
        }
    });

    it.each([{}, { name: '' }, { name: '   ' }, { name: 'Pan', quantity: 2 }, { name: 'Pan', purchased: 'yes' }])(
        'rejects invalid inputs: %j', async payload => {
            const response = await setup.fastifyInstance.inject({ method: 'POST', url: '/api/shopping-items', headers, payload });
            expect(response.statusCode).toBe(422);
            expect(await ShoppingItemModel.countDocuments()).toBe(0);
        },
    );

    it('paginates, searches and filters only the current user shopping items', async () => {
        await create();
        await create({ name: 'Pan', purchased: true });
        await ShoppingItemServiceFactory.instance.create({ name: 'Ajeno', user: setup.basicUser._id });
        const paginated = await setup.fastifyInstance.inject({ method: 'GET', url: '/api/shopping-items?page=1&limit=1', headers });
        expect(paginated.statusCode).toBe(200);
        expect(paginated.json().total).toBe(2);
        expect(paginated.json().items).toHaveLength(1);
        const filtered = await setup.fastifyInstance.inject({ method: 'GET', url: '/api/shopping-items/find?filters=purchased;eq;false', headers });
        expect(filtered.json()).toHaveLength(1);
        expect(filtered.json()[0].name).toBe('Leche');
        const search = await setup.fastifyInstance.inject({ method: 'GET', url: '/api/shopping-items/search?search=Pan', headers });
        expect(search.json()).toHaveLength(1);
        const grouped = await setup.fastifyInstance.inject({ method: 'GET', url: '/api/shopping-items/group-by?fields=purchased', headers });
        expect(grouped.statusCode).toBe(200);
        expect(grouped.json()).toHaveLength(2);
    });

    it('deletes items and returns not found afterwards', async () => {
        const item = await create();
        const response = await setup.fastifyInstance.inject({ method: 'DELETE', url: `/api/shopping-items/${item._id}`, headers });
        expect(response.statusCode).toBe(200);
        expect(await ShoppingItemServiceFactory.instance.findById(item._id)).toBeNull();
        const missing = await setup.fastifyInstance.inject({ method: 'GET', url: `/api/shopping-items/${item._id}`, headers });
        expect(missing.statusCode).toBe(404);
    });

    it('requires authentication and CRUD permission', async () => {
        const anonymous = await setup.fastifyInstance.inject({ method: 'GET', url: '/api/shopping-items' });
        expect(anonymous.statusCode).toBe(401);
        const { accessToken } = await setup.basicUserLogin();
        const forbidden = await setup.fastifyInstance.inject({ method: 'POST', url: '/api/shopping-items',
            headers: { Authorization: `Bearer ${accessToken}` }, payload: { name: 'Pan' } });
        expect(forbidden.statusCode).toBe(403);
    });

    it.each(['GET', 'PATCH', 'DELETE'] as const)('rejects %s access to another user item', async method => {
        const item = await ShoppingItemServiceFactory.instance.create({ name: 'Ajeno', user: setup.basicUser._id });
        const response = await setup.fastifyInstance.inject({ method, url: `/api/shopping-items/${item._id}`, headers,
            ...(method === 'PATCH' ? { payload: { purchased: true } } : {}) });
        expect(response.statusCode).toBe(401);
    });

    it('returns errors for invalid and missing ids', async () => {
        for (const [id, status] of [['invalid', 400], [new mongoose.Types.ObjectId().toString(), 404]] as const) {
            const response = await setup.fastifyInstance.inject({ method: 'GET', url: `/api/shopping-items/${id}`, headers });
            expect(response.statusCode).toBe(status);
        }
    });

    it('registers working AI tools through AgentConfigService with ownership protection', async () => {
        const context: DraxAgentPromptContext = { session: {
            id: 'shopping-test', userId: setup.rootUser._id.toString(), messages: [], createdAt: new Date(), updatedAt: new Date(),
        } };
        for (const config of [AgentConfigService.instance.buildAgentConfig(), AgentConfigService.instance.jobAgent.buildConfig()]) {
            const source = config.toolBuilders!;
            const builders = typeof source === 'function' ? await source(context) : source;
            const builder = builders.find(candidate => candidate.getTools().some(tool => tool.name === 'ShoppingItem_create'))!;
            expect(builder).toBeDefined();
            const tools = builder.getTools();
            const item = await tools.find(tool => tool.name === 'ShoppingItem_create')!.execute({ data: { name: 'Arroz', quantity: '1 kg', user: setup.basicUser._id } });
            expect(item.user._id).toBe(setup.rootUser._id.toString());
            const update = tools.find(tool => tool.name === 'ShoppingItem_updatePartial')!;
            const bought = await update.execute({ id: item._id, data: { purchased: true } });
            expect(bought.purchased).toBe(true);
            expect(bought.purchasedAt).toBeInstanceOf(Date);
            const other = await ShoppingItemServiceFactory.instance.create({ name: 'Ajeno', user: setup.basicUser._id });
            await expect(update.execute({ id: other._id, data: { purchased: true } })).rejects.toThrow();
            const found = await tools.find(tool => tool.name === 'ShoppingItem_find')!.execute({ filters: [] });
            expect(found.every((entry: any) => entry.user._id === setup.rootUser._id.toString())).toBe(true);
        }
    });
});
