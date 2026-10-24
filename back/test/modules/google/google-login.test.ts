import {afterEach, beforeEach, describe, expect, it, vi, type MockInstance} from 'vitest';
import {CommonConfig, DraxConfig} from '@drax/common-back';
import {AuthUtils, BadCredentialsError, IdentityConfig, jwtMiddleware, RoleServiceFactory, TenantServiceFactory, UserService, UserServiceFactory, UserSessionServiceFactory} from '@drax/identity-back';
import RefreshTokenService from '@drax/identity-back/dist/services/RefreshTokenService.js';
import {OAuth2Client} from 'google-auth-library';
import Fastify from 'fastify';
import GoogleFastifyRoutes from '../../../src/modules/google/routes/GoogleRoutes.js';
import GoogleController from '../../../src/modules/google/controllers/GoogleController.js';
import GoogleAuthService from '../../../src/modules/google/services/GoogleAuthService.js';

const {validateToken} = vi.hoisted(() => ({validateToken: vi.fn()}));
vi.mock('../../../src/modules/google/factory/GoogleAuthServiceFactory.js', () => ({
    default: {instance: {validateToken}},
}));

const profile = {email: 'ana@example.com', email_verified: true, name: 'Ana Perez', picture: 'https://example.com/avatar.png'};
const request = {body: {credential: 'google-token'}, headers: {'user-agent': 'test'}, ip: '127.0.0.1'};
const tokens = {accessToken: 'access-token'};

describe('Installed Drax Google remember-me compatibility', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        DraxConfig.set(IdentityConfig.RememberMeEnabled, undefined);
        DraxConfig.set(IdentityConfig.RefreshTokenTTLSeconds, undefined);
    });

    it.each([
        [false, undefined], [false, false], [false, true],
        [true, undefined], [true, false], [true, true],
    ])('authByEmail requires flag=%s and opt-in=%s for a remembered session', async (enabled, rememberMe) => {
        DraxConfig.set(CommonConfig.DbEngine, 'mongo');
        DraxConfig.set(IdentityConfig.RememberMeEnabled, enabled);
        DraxConfig.set(IdentityConfig.RefreshTokenTTLSeconds, 2592000);
        const user = {
            _id: 'google-user', username: 'AnaPerez', active: true, password: 'test-password-hash',
            role: {_id: 'principal-role', name: 'Principal'},
        };
        const users = {findByEmail: vi.fn().mockResolvedValue(user), findByIdWithPassword: vi.fn().mockResolvedValue(user)};
        const refreshRepository = {create: vi.fn().mockResolvedValue(undefined)};
        // Real Drax services, isolated persistence: no connection or production configuration is loaded.
        const refreshService = new RefreshTokenService(refreshRepository as any, users as any);
        const userService = new UserService(users as any, undefined, undefined, refreshService);
        const createSession = vi.spyOn(UserSessionServiceFactory(), 'create').mockResolvedValue({} as any);
        vi.spyOn(AuthUtils, 'generateToken').mockReturnValue('access-token');

        const result = await userService.authByEmail(profile.email, false, {} as any, {
            userAgent: 'test', ip: '127.0.0.1',
        }, rememberMe);

        const remembered = enabled && rememberMe === true;
        if (remembered) {
            // Avoid printing credentials in assertion failures.
            expect(typeof result.refreshToken).toBe('string');
            expect(Number.isFinite(Date.parse(result.refreshExpiresAt!))).toBe(true);
            expect(refreshRepository.create).toHaveBeenCalledOnce();
            expect(users.findByIdWithPassword).toHaveBeenCalledExactlyOnceWith('google-user');
            const record = refreshRepository.create.mock.calls[0][0];
            expect(record.tokenHash === result.refreshToken).toBe(false);
        } else {
            expect(result).toEqual(tokens);
            expect(refreshRepository.create).not.toHaveBeenCalled();
            expect(users.findByIdWithPassword).not.toHaveBeenCalled();
        }
        expect(createSession).toHaveBeenCalledExactlyOnceWith({
            user: 'google-user', uuid: expect.any(String), userAgent: 'test', ip: '127.0.0.1',
            ...(remembered ? {rememberMe: true, refreshExpiresAt: result.refreshExpiresAt} : {}),
        });
    });
});

describe('Google credential verification', () => {
    beforeEach(() => {
        vi.stubEnv('GOOGLE_CLIENT_ID', 'test-google-client');
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it('delegates signature, issuer and audience verification to the Google library', async () => {
        const verify = vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({getPayload: () => profile} as any);
        expect(await new GoogleAuthService().validateToken('google-token')).toEqual(profile);
        expect(verify).toHaveBeenCalledExactlyOnceWith({idToken: 'google-token', audience: 'test-google-client'});
    });

    it.each([undefined, {}, {...profile, email: undefined}, {...profile, email_verified: false}, {...profile, email_verified: undefined}])(
        'rejects a missing or unverified email (%j)', async payload => {
            vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({getPayload: () => payload} as any);
            await expect(new GoogleAuthService().validateToken('google-token')).rejects.toBeInstanceOf(BadCredentialsError);
        },
    );

    it('rejects library verification failures', async () => {
        vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockRejectedValue(new Error('Invalid signature or audience'));
        await expect(new GoogleAuthService().validateToken('google-token')).rejects.toBeInstanceOf(BadCredentialsError);
    });

    it('fails closed if no audience is configured', async () => {
        vi.stubEnv('GOOGLE_CLIENT_ID', '');
        const verify = vi.spyOn(OAuth2Client.prototype, 'verifyIdToken');
        await expect(new GoogleAuthService().validateToken('google-token')).rejects.toThrow('GOOGLE_CLIENT_ID must be configured');
        expect(verify).not.toHaveBeenCalled();
    });
});

describe('Google login tenant registration', () => {
    let controller: GoogleController;
    let reply: any;
    let findByEmail: ReturnType<typeof vi.spyOn>;
    let authByEmail: MockInstance<UserService['authByEmail']>;
    let createTenant: ReturnType<typeof vi.spyOn>;
    let deleteTenant: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        DraxConfig.set(CommonConfig.DbEngine, 'mongo');

        DraxConfig.set(IdentityConfig.RegistrationTenantEnabled, true);
        DraxConfig.set(IdentityConfig.defaultRole, 'Principal');
        validateToken.mockReset().mockResolvedValue(profile);
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
        }), {userAgent: 'test', ip: '127.0.0.1'}, false);
        expect(deleteTenant).not.toHaveBeenCalled();
    });

    it.each([false, true])('passes explicit rememberMe=%s through the tenant registration branch', async rememberMe => {
        findByEmail.mockResolvedValueOnce(null).mockResolvedValue({tenant: 'new-tenant'});
        const response = rememberMe
            ? {...tokens, refreshToken: 'fixture-refresh-token', refreshExpiresAt: '2030-01-01T00:00:00.000Z'}
            : tokens;
        authByEmail.mockResolvedValue(response);
        expect(await controller.login({...request, body: {...request.body, rememberMe}}, reply)).toEqual(response);
        expect(authByEmail.mock.calls[0][4]).toBe(rememberMe);
        expect(authByEmail.mock.calls[0][2].tenant).toBe('new-tenant');
    });

    it.each([undefined, false, true])('returns the complete Drax response without tenant registration (rememberMe=%s)', async rememberMe => {
        DraxConfig.set(IdentityConfig.RegistrationTenantEnabled, false);
        const response = {...tokens, refreshToken: 'fixture-refresh-token', refreshExpiresAt: '2030-01-01T00:00:00.000Z'};
        authByEmail.mockResolvedValue(response);
        expect(await controller.login({...request, body: {...request.body, rememberMe}}, reply)).toEqual(response);
        expect(authByEmail.mock.calls[0][4]).toBe(rememberMe === true);
        expect(validateToken.mock.invocationCallOrder[0]).toBeLessThan(authByEmail.mock.invocationCallOrder[0]);
    });

    it('passes opt-in for an existing account when tenant registration is enabled', async () => {
        findByEmail.mockResolvedValue({_id: 'existing-user', tenant: 'existing-tenant'});
        await controller.login({...request, body: {...request.body, rememberMe: true}}, reply);
        expect(authByEmail.mock.calls[0][4]).toBe(true);
        expect(createTenant).not.toHaveBeenCalled();
    });

    it.each([
        undefined, null, {}, {credential: ''}, {credential: '   '}, {credential: 123},
        {credential: null}, {credential: ['token']},
        ...['true', 'false', 0, 1, null, {}, []].map(rememberMe => ({credential: 'google-token', rememberMe})),
    ])('rejects an invalid body before Google verification (%j)', async body => {
        await controller.login({...request, body}, reply);
        expect(reply.code).toHaveBeenCalledExactlyOnceWith(400);
        expect(reply.send).toHaveBeenCalledOnce();
        expect(validateToken).not.toHaveBeenCalled();
        expect(authByEmail).not.toHaveBeenCalled();
        expect(createTenant).not.toHaveBeenCalled();
    });

    it('sends exactly one 401 for rejected Google credentials', async () => {
        validateToken.mockRejectedValueOnce(new BadCredentialsError());
        await controller.login(request, reply);
        expect(reply.code).toHaveBeenCalledExactlyOnceWith(401);
        expect(reply.send).toHaveBeenCalledExactlyOnceWith({error: 'error.badCredentials'});
        expect(authByEmail).not.toHaveBeenCalled();
        expect(createTenant).not.toHaveBeenCalled();
    });

    it('sends exactly one 401 if Drax rejects authentication', async () => {
        DraxConfig.set(IdentityConfig.RegistrationTenantEnabled, false);
        authByEmail.mockRejectedValueOnce(new BadCredentialsError());
        await controller.login(request, reply);
        expect(reply.code).toHaveBeenCalledExactlyOnceWith(401);
        expect(reply.send).toHaveBeenCalledOnce();
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


    it.each([undefined, false, true])('preserves the full HTTP response (rememberMe=%s)', async rememberMe => {
        DraxConfig.set(IdentityConfig.RegistrationTenantEnabled, false);
        const responseBody = rememberMe === true
            ? {...tokens, refreshToken: 'fixture-refresh-token', refreshExpiresAt: '2030-01-01T00:00:00.000Z'}
            : tokens;
        authByEmail.mockResolvedValue(responseBody);
        const app = Fastify();
        app.register(GoogleFastifyRoutes);
        try {
            const response = await app.inject({
                method: 'POST', url: '/api/google/login', payload: {credential: 'google-token', rememberMe},
            });
            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual(responseBody);
            expect(authByEmail.mock.calls[0][4]).toBe(rememberMe === true);

            const invalid = await app.inject({
                method: 'POST', url: '/api/google/login', payload: {credential: 'google-token', rememberMe: 'true'},
            });
            expect(invalid.statusCode).toBe(400);
            expect(authByEmail).toHaveBeenCalledOnce();
        } finally {
            await app.close();
        }
    });

    it.each(['/api/google/login', '/api/google/login?source=google'])(
        'ignores an expired Drax JWT on %s but still validates Google credentials', async url => {
            DraxConfig.set(IdentityConfig.RegistrationTenantEnabled, false);
            const verifyJwt = vi.spyOn(AuthUtils, 'verifyToken').mockImplementation(() => {
                throw Object.assign(new Error('jwt expired'), {name: 'TokenExpiredError'});
            });
            const app = Fastify();
            app.addHook('onRequest', (request, reply, done) => { jwtMiddleware(request, reply, done); });
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
        app.addHook('onRequest', (request, reply, done) => { jwtMiddleware(request, reply, done); });
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
