import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {CommonConfig, DraxConfig} from '@drax/common-back';
import {AuthUtils, IdentityConfig, jwtMiddleware, RoleServiceFactory, TenantServiceFactory, UserServiceFactory} from '@drax/identity-back';
import Fastify from 'fastify';
import GoogleFastifyRoutes from '../../../src/modules/google/routes/GoogleRoutes.js';
import GoogleController from '../../../src/modules/google/controllers/GoogleController.js';

const {validateToken} = vi.hoisted(() => ({validateToken: vi.fn()}));
vi.mock('../../../src/modules/google/factory/GoogleAuthServiceFactory.js', () => ({
    default: {instance: {validateToken}},
}));

const profile = {email: 'ana@example.com', name: 'Ana Perez', picture: 'https://example.com/avatar.png'};
const request = {body: {credential: 'google-token'}, headers: {'user-agent': 'test'}, ip: '127.0.0.1'};
const tokens = {accessToken: 'access-token'};

describe('Google login tenant registration', () => {
    let controller: GoogleController;
    let reply: any;
    let findByEmail: ReturnType<typeof vi.spyOn>;
    let authByEmail: ReturnType<typeof vi.spyOn>;
    let createTenant: ReturnType<typeof vi.spyOn>;
    let deleteTenant: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        DraxConfig.set(CommonConfig.DbEngine, 'mongo');

        DraxConfig.set(IdentityConfig.RegistrationTenantEnabled, true);
        DraxConfig.set(IdentityConfig.defaultRole, 'Principal');
        validateToken.mockResolvedValue(profile);
        vi.spyOn(RoleServiceFactory(), 'findByName').mockResolvedValue({_id: 'principal-role', name: 'Principal'} as any);
        findByEmail = vi.spyOn(UserServiceFactory(), 'findByEmail').mockResolvedValue(null);
        authByEmail = vi.spyOn(UserServiceFactory(), 'authByEmail').mockResolvedValue(tokens);
        createTenant = vi.spyOn(TenantServiceFactory(), 'create').mockResolvedValue({_id: 'new-tenant', name: 'AnaPerez'} as any);
        deleteTenant = vi.spyOn(TenantServiceFactory(), 'delete').mockResolvedValue(true);
        vi.spyOn(console, 'error').mockImplementation(() => {});
        controller = new GoogleController();
        reply = {code: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis()};
    });

    afterEach(() => {
        vi.restoreAllMocks();
        DraxConfig.set(IdentityConfig.RegistrationTenantEnabled, false);
    });

    it('creates a tenant named after the username and passes its ID before authentication', async () => {
        findByEmail.mockResolvedValueOnce(null).mockResolvedValue({tenant: {_id: 'new-tenant'}});
        expect(await controller.login(request, reply)).toEqual(tokens);
        expect(createTenant).toHaveBeenCalledExactlyOnceWith({name: 'AnaPerez'});
        expect(authByEmail).toHaveBeenCalledExactlyOnceWith(profile.email, true, expect.objectContaining({
            username: 'AnaPerez', tenant: 'new-tenant', active: true, origin: 'Google', role: 'principal-role',
        }), {userAgent: 'test', ip: '127.0.0.1'});
        expect(deleteTenant).not.toHaveBeenCalled();
    });

    it('uses the configured default role and its required _id rather than the optional id', async () => {
        DraxConfig.set(IdentityConfig.RegistrationTenantEnabled, false);
        expect(await controller.login(request, reply)).toEqual(tokens);
        expect(RoleServiceFactory().findByName).toHaveBeenCalledExactlyOnceWith('Principal');
        expect(authByEmail.mock.calls[0][2].role).toBe('principal-role');
    });

    it('does not create a tenant or user when the default role is not configured', async () => {
        DraxConfig.set(IdentityConfig.defaultRole, '');
        await controller.login(request, reply);
        expect(RoleServiceFactory().findByName).not.toHaveBeenCalled();
        expect(createTenant).not.toHaveBeenCalled();
        expect(authByEmail).not.toHaveBeenCalled();
        expect(reply.code).toHaveBeenCalledWith(500);
    });

    it('does not create a tenant or user when the configured role does not exist', async () => {
        vi.mocked(RoleServiceFactory().findByName).mockResolvedValue(null);
        await controller.login(request, reply);
        expect(createTenant).not.toHaveBeenCalled();
        expect(authByEmail).not.toHaveBeenCalled();
        expect(reply.code).toHaveBeenCalledWith(500);
    });

    it('preserves registration without a tenant when the option is disabled', async () => {
        DraxConfig.set(IdentityConfig.RegistrationTenantEnabled, false);
        expect(await controller.login(request, reply)).toEqual(tokens);
        expect(createTenant).not.toHaveBeenCalled();
        expect(findByEmail).not.toHaveBeenCalled();
        expect(authByEmail.mock.calls[0][2]).not.toHaveProperty('tenant');
    });

    it.each([null, {_id: 'existing-tenant'}])('does not create or change tenants for an existing account (%j)', async tenant => {
        findByEmail.mockResolvedValue({_id: 'existing-user', tenant});
        expect(await controller.login(request, reply)).toEqual(tokens);
        expect(createTenant).not.toHaveBeenCalled();
        expect(authByEmail.mock.calls[0][2]).not.toHaveProperty('tenant');
    });

    it('removes the tenant if user creation fails', async () => {
        authByEmail.mockRejectedValue(new Error('User creation failed'));
        await controller.login(request, reply);
        expect(deleteTenant).toHaveBeenCalledExactlyOnceWith('new-tenant');
        expect(reply.code).toHaveBeenCalledWith(500);
    });

    it.each(['new-tenant', {_id: 'new-tenant'}])('retains an assigned tenant if authentication fails after persistence (%j)', async tenant => {
        findByEmail.mockResolvedValueOnce(null).mockResolvedValue({tenant});
        authByEmail.mockRejectedValue(new Error('Session creation failed'));
        await controller.login(request, reply);
        expect(deleteTenant).not.toHaveBeenCalled();
        expect(reply.code).toHaveBeenCalledWith(500);
    });

    it('removes an unused tenant if another request already created the account', async () => {
        findByEmail.mockResolvedValueOnce(null).mockResolvedValue({tenant: {_id: 'other-tenant'}});
        expect(await controller.login(request, reply)).toEqual(tokens);
        expect(deleteTenant).toHaveBeenCalledExactlyOnceWith('new-tenant');
    });

    it('does not authenticate if tenant creation fails', async () => {
        createTenant.mockRejectedValue(new Error('Duplicate tenant name'));
        await controller.login(request, reply);
        expect(authByEmail).not.toHaveBeenCalled();
        expect(deleteTenant).not.toHaveBeenCalled();
        expect(reply.code).toHaveBeenCalledWith(500);
    });


    it.each(['/api/google/login', '/api/google/login?source=google'])(
        'ignores an expired Drax JWT on %s but still validates Google credentials', async url => {
            DraxConfig.set(IdentityConfig.RegistrationTenantEnabled, false);
            const verifyJwt = vi.spyOn(AuthUtils, 'verifyToken').mockImplementation(() => {
                throw Object.assign(new Error('jwt expired'), {name: 'TokenExpiredError'});
            });
            const app = Fastify();
            app.addHook('onRequest', jwtMiddleware);
            app.register(GoogleFastifyRoutes);
            try {
                const response = await app.inject({
                    method: 'POST', url, headers: {authorization: 'Bearer expired-token'},
                    payload: {credential: 'google-token'},
                });
                expect(response.statusCode).toBe(200);
                expect(response.json()).toEqual(tokens);
                expect(verifyJwt).not.toHaveBeenCalled();
                expect(validateToken).toHaveBeenCalledWith('google-token');

                authByEmail.mockClear();
                validateToken.mockRejectedValueOnce(new Error('Invalid Google credential'));
                const rejected = await app.inject({
                    method: 'POST', url, headers: {authorization: 'Bearer expired-token'},
                    payload: {credential: 'invalid-google-token'},
                });
                expect(rejected.statusCode).toBeGreaterThanOrEqual(400);
                expect(validateToken).toHaveBeenLastCalledWith('invalid-google-token');
                expect(authByEmail).not.toHaveBeenCalled();
            } finally {
                await app.close();
            }
        },
    );

    it('continues validating Drax JWTs on Google connection routes', async () => {
        const verifyJwt = vi.spyOn(AuthUtils, 'verifyToken').mockImplementation(() => {
            throw Object.assign(new Error('jwt expired'), {name: 'TokenExpiredError'});
        });
        const app = Fastify();
        app.addHook('onRequest', jwtMiddleware);
        app.register(GoogleFastifyRoutes);
        try {
            const response = await app.inject({
                method: 'GET', url: '/api/google/connections/me',
                headers: {authorization: 'Bearer expired-token'},
            });
            expect(response.statusCode).toBe(498);
            expect(verifyJwt).toHaveBeenCalledWith('expired-token');
            expect(authByEmail).not.toHaveBeenCalled();
        } finally {
            await app.close();
        }
    });

    it('does not create a tenant or authenticate for an invalid Google credential', async () => {
        validateToken.mockRejectedValueOnce(new Error('Invalid Google credential'));
        await controller.login(request, reply);
        expect(createTenant).not.toHaveBeenCalled();
        expect(authByEmail).not.toHaveBeenCalled();
    });
});
