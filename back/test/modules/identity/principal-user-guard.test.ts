import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import Fastify from 'fastify';
import {CommonConfig, DraxConfig} from '@drax/common-back';
import {Rbac, UserPermissions, UserRoutes, UserServiceFactory} from '@drax/identity-back';
import type {IAuthUser, IRole} from '@drax/identity-share';
import FastifyServer from '../../../src/servers/FastifyServer.js';
import {registerPrincipalUserGuard} from '../../../src/modules/identity/PrincipalUserGuard.js';

class TestServer extends FastifyServer {
    get app() { return this.fastifyServer; }
    logger() { return false as any; }
}

const principal: IRole = {
    _id: 'principal', name: 'Principal', readonly: false,
    permissions: Object.values(UserPermissions),
    childRoles: [{_id: 'collaborator', name: 'Colaborador'} as IRole],
};
const authUser: IAuthUser = {
    id: 'principal-user', username: 'principal', roleId: 'principal',
    roleName: 'Principal', tenantId: 'tenant-a',
};
const input = {
    name: 'Collaborator', username: 'collaborator', email: 'collaborator@example.com',
    password: 'Secret123!', role: 'collaborator',
};
const existing = {
    _id: 'target', ...input, active: true,
    role: {_id: 'collaborator', name: 'Colaborador', permissions: []},
    tenant: {_id: 'tenant-a', name: 'Tenant A'},
};
const targetOperations = [
    {method: 'PUT' as const, url: '/api/users/target', payload: input},
    {method: 'DELETE' as const, url: '/api/users/target'},
    {method: 'POST' as const, url: '/api/users/password/change/target', payload: {newPassword: 'Secret456!'}},
];

describe('Principal user guard with installed UserRoutes and server registration', () => {
    let server: TestServer;
    let rbac: Rbac;
    let service: ReturnType<typeof UserServiceFactory>;
    let findById: ReturnType<typeof vi.spyOn>;
    let create: ReturnType<typeof vi.spyOn>;
    let update: ReturnType<typeof vi.spyOn>;
    let remove: ReturnType<typeof vi.spyOn>;
    let password: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        DraxConfig.set(CommonConfig.DbEngine, 'mongo');
        service = UserServiceFactory();
        findById = vi.spyOn(service, 'findById').mockResolvedValue(existing as any);
        create = vi.spyOn(service, 'create').mockResolvedValue(existing as any);
        update = vi.spyOn(service, 'update').mockResolvedValue(existing as any);
        remove = vi.spyOn(service, 'delete').mockResolvedValue(true);
        password = vi.spyOn(service, 'changeUserPassword').mockResolvedValue(existing as any);
        rbac = new Rbac({...authUser}, structuredClone(principal));
        server = new TestServer(process.cwd());
        server.fastifyHook('onRequest', async request => { request.rbac = rbac; });
        server.fastifyRegister(UserRoutes);
    });

    afterEach(async () => {
        await server.app.close();
        vi.restoreAllMocks();
    });

    it.each([undefined, 'tenant-a'])('creates a child role in own tenant (input tenant=%s)', async tenant => {
        const response = await server.app.inject({method: 'POST', url: '/api/users', payload: {...input, tenant}});
        expect(response.statusCode).toBe(200);
        expect(create).toHaveBeenCalledWith(expect.objectContaining({role: 'collaborator', tenant: 'tenant-a'}));
        expect(findById).not.toHaveBeenCalled();
    });

    it.each(['principal', 'admin', 'unknown', null, { _id: 'collaborator' }])('rejects role escalation on create/update: %j', async role => {
        for (const request of [{method: 'POST' as const, url: '/api/users'}, {method: 'PUT' as const, url: '/api/users/target'}]) {
            const response = await server.app.inject({...request, payload: {...input, role}});
            expect(response.statusCode).toBe(403);
        }
        expect(create).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
    });

    it.each(['tenant-b', null, {_id: 'tenant-a'}])('rejects tenant reassignment on create/update: %j', async tenant => {
        for (const request of [{method: 'POST' as const, url: '/api/users'}, {method: 'PUT' as const, url: '/api/users/target'}]) {
            const response = await server.app.inject({...request, payload: {...input, tenant}});
            expect(response.statusCode).toBe(403);
        }
        expect(create).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
    });

    it.each(targetOperations)('allows own-tenant operation: $method $url', async request => {
        const response = await server.app.inject(request);
        expect(response.statusCode).toBe(200);
        expect(findById).toHaveBeenCalledWith('target');
        expect(update.mock.calls.length + remove.mock.calls.length + password.mock.calls.length).toBe(1);
    });

    it.each(['tenant-b', {_id: 'tenant-b', name: 'Other'}, null, undefined])('blocks all target operations outside own tenant: %j', async tenant => {
        findById.mockResolvedValue({...existing, tenant});
        for (const request of targetOperations) {
            const response = await server.app.inject(request);
            expect(response.statusCode).toBe(403);
        }
        expect(update).not.toHaveBeenCalled();
        expect(remove).not.toHaveBeenCalled();
        expect(password).not.toHaveBeenCalled();
    });

    it('accepts an unpopulated own-tenant reference', async () => {
        findById.mockResolvedValue({...existing, tenant: 'tenant-a'});
        const response = await server.app.inject(targetOperations[0]);
        expect(response.statusCode).toBe(200);
        expect(update).toHaveBeenCalledWith('target', expect.objectContaining({tenant: 'tenant-a'}));
    });

    it('fails closed if Principal has no tenant', async () => {
        rbac = new Rbac({...authUser, tenantId: undefined}, principal);
        for (const request of [{method: 'POST' as const, url: '/api/users', payload: input}, ...targetOperations]) {
            expect((await server.app.inject(request)).statusCode).toBe(403);
        }
        expect(findById).not.toHaveBeenCalled();
        expect(create).not.toHaveBeenCalled();
    });

    it('does not interpret empty childRoles as unrestricted', async () => {
        rbac = new Rbac(authUser, {...principal, childRoles: []});
        expect((await server.app.inject({method: 'POST', url: '/api/users', payload: input})).statusCode).toBe(403);
        expect(create).not.toHaveBeenCalled();
    });

    it.each(targetOperations)('returns 404 without mutation for missing target: $method $url', async request => {
        findById.mockResolvedValue(null);
        expect((await server.app.inject(request)).statusCode).toBe(404);
        expect(update).not.toHaveBeenCalled();
        expect(remove).not.toHaveBeenCalled();
        expect(password).not.toHaveBeenCalled();
    });

    it('keeps permission checks before target lookup', async () => {
        rbac = new Rbac(authUser, {...principal, permissions: []});
        for (const request of [{method: 'POST' as const, url: '/api/users', payload: input}, ...targetOperations]) {
            expect((await server.app.inject(request)).statusCode).toBe(403);
        }
        expect(findById).not.toHaveBeenCalled();
        expect(create).not.toHaveBeenCalled();
    });

    it('does not grant administrative access to anonymous callers', async () => {
        rbac = new Rbac(null as any, null as any);
        expect((await server.app.inject({method: 'POST', url: '/api/users', payload: input})).statusCode).toBe(401);
        expect(create).not.toHaveBeenCalled();
    });

    it('does not restrict Admin assignments', async () => {
        rbac = new Rbac({...authUser, roleId: 'admin', roleName: 'Admin', tenantId: undefined}, {...principal, name: 'Admin'});
        expect((await server.app.inject({method: 'POST', url: '/api/users', payload: {...input, role: 'admin', tenant: 'tenant-b'}})).statusCode).toBe(200);
        expect(create).toHaveBeenCalledWith(expect.objectContaining({role: 'admin', tenant: 'tenant-b'}));
    });

    it('matches registered route metadata even with query parameters', async () => {
        expect((await server.app.inject({method: 'PUT', url: '/api/users/target?x=1', payload: {...input, role: 'admin'}})).statusCode).toBe(403);
        expect(update).not.toHaveBeenCalled();
    });
});

describe('Guard scope', () => {
    it('leaves public and self-service routes untouched, including future registration', async () => {
        const app = Fastify();
        registerPrincipalUserGuard(app);
        app.addHook('onRequest', async request => {
            request.rbac = new Rbac({...authUser, tenantId: undefined}, principal);
        });
        const routes = [
            '/api/users/register', '/api/users/password/recovery/request',
            '/api/users/password/recovery/complete', '/api/users/password/change',
            '/api/auth/login', '/api/future/register',
        ];
        for (const route of routes) app.post(route, async request => request.body);
        try {
            for (const url of routes) {
                const response = await app.inject({method: 'POST', url, payload: {role: 'admin', tenant: 'other'}});
                expect(response.statusCode).toBe(200);
                expect(response.json()).toEqual({role: 'admin', tenant: 'other'});
            }
        } finally {
            await app.close();
        }
    });
});
