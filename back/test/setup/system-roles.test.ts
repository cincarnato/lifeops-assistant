import {describe, expect, it, vi} from 'vitest';
import {readdirSync} from 'node:fs';

const {createOrUpdateRole} = vi.hoisted(() => ({createOrUpdateRole: vi.fn(async role => {
    role.childRoles = role.childRoles.map(name => `id:${name}`);
})}));
vi.mock('@drax/identity-back', () => ({
    CreateOrUpdateRole: createOrUpdateRole,
    UserPermissions: {Create: 'user:create', View: 'user:view', Update: 'user:update', Delete: 'user:delete', Manage: 'user:manage', ChangePassword: 'user:changePassword'},
    RolePermissions: {View: 'role:view'},
}));

import principalRole from '../../src/setup/data/roles/principal-role.js';
import colaboradorRole from '../../src/setup/data/roles/colaborador-role.js';
import CreateSystemRoles from '../../src/setup/CreateSystemRoles.js';

const excluded = ['TaskType', 'TaskStatus', 'Source', 'LifeArea', 'Priority', 'ContactType', 'MemoryType'];

describe('system roles', () => {
    it('grants every operational LifeOps and Google permission to both roles, excluding catalogs', async () => {
        const expected: string[] = [];
        const catalogPermissions: string[] = [];
        for (const module of ['lifeops', 'google']) {
            const directory = new URL(`../../src/modules/${module}/permissions/`, import.meta.url);
            for (const file of readdirSync(directory).filter(file => file.endsWith('Permissions.ts'))) {
                const permissions = Object.values((await import(new URL(file, directory).href)).default) as string[];
                (excluded.some(entity => file === `${entity}Permissions.ts`) ? catalogPermissions : expected).push(...permissions);
            }
        }
        expect([...colaboradorRole.permissions].sort()).toEqual(expected.sort());
        expect(principalRole.permissions).toEqual(expect.arrayContaining(expected));
        for (const role of [principalRole, colaboradorRole]) {
            expect(role.permissions.some(permission => catalogPermissions.includes(permission))).toBe(false);
            expect(role.readonly).toBe(true);
        }
    });

    it('restricts Principal to Colaborador children and user administration without tenant switching', () => {
        expect(principalRole.name).toBe('Principal');
        expect(colaboradorRole.name).toBe('Colaborador');
        expect(principalRole.childRoles).toEqual(['Colaborador']);
        expect(colaboradorRole.childRoles).toEqual([]);
        expect(principalRole.permissions).toEqual(expect.arrayContaining([
            'user:create', 'user:view', 'user:update', 'user:delete', 'user:manage', 'user:changePassword', 'role:view',
        ]));
        expect(principalRole.permissions).not.toContain('user:switchTenant');
        expect(principalRole.permissions).not.toContain('role:update');
        expect(colaboradorRole.permissions.some(permission => permission.startsWith('user:'))).toBe(false);
    });

    it('creates Colaborador before Principal and preserves role names across repeated setup', async () => {
        createOrUpdateRole.mockClear();
        await CreateSystemRoles();
        await CreateSystemRoles();
        expect(createOrUpdateRole.mock.calls.map(([role]) => role.name)).toEqual([
            'Colaborador', 'Principal', 'Colaborador', 'Principal',
        ]);
        expect(principalRole.childRoles).toEqual(['Colaborador']);
    });
});
