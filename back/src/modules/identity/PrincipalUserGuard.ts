import type {FastifyInstance} from 'fastify';
import {ForbiddenError, NotFoundError} from '@drax/common-back';
import {UserPermissions, UserServiceFactory} from '@drax/identity-back';

const operations = {
    'POST /api/users': UserPermissions.Create,
    'PUT /api/users/:id': UserPermissions.Update,
    'DELETE /api/users/:id': UserPermissions.Delete,
    'POST /api/users/password/change/:id': UserPermissions.ChangePassword,
};

function referenceId(value: unknown): string | undefined {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && '_id' in value) {
        return value._id?.toString();
    }
    return undefined;
}

export function registerPrincipalUserGuard(fastify: FastifyInstance): void {
    fastify.addHook('preHandler', async request => {
        // Match registered administrative routes, never the public registration/recovery flows.
        const permission = operations[`${request.method} ${request.routeOptions.url}`];
        const rbac = request.rbac;
        if (!permission || rbac?.getRole?.name !== 'Principal') return;

        rbac.assertPermission(permission);
        const tenantId = rbac.tenantId;
        if (!tenantId) throw new ForbiddenError();

        const {id} = request.params as {id?: string};
        if (id) {
            const user = await UserServiceFactory().findById(id);
            if (!user) throw new NotFoundError();
            // Users without a tenant are not owned by Principal either.
            if (referenceId(user.tenant) !== tenantId) throw new ForbiddenError();
        }

        if (permission !== UserPermissions.Create && permission !== UserPermissions.Update) return;

        const payload = request.body as {role?: unknown; tenant?: unknown} | undefined;
        if (!payload || typeof payload !== 'object') throw new ForbiddenError();
        if (payload.tenant !== undefined && payload.tenant !== tenantId) throw new ForbiddenError();

        if (permission === UserPermissions.Create || payload.role !== undefined) {
            const allowedRoles = rbac.getRole.childRoles || [];
            if (typeof payload.role !== 'string' || !allowedRoles.some(role => referenceId(role) === payload.role)) {
                throw new ForbiddenError();
            }
        }
        payload.tenant = tenantId;
    });
}
