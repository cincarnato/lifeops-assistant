# Tenants y roles operativos

## Alcance

Las 18 entidades operativas de LifeOps tienen `tenant`, referencia a `Tenant`, con ID en entradas y objeto poblado en salidas. `TaskArchived` hereda el campo de `Task`. Los controllers activan `tenantField`, `tenantFilter`, `tenantSetter` y `tenantAssert`; conservan las restricciones por usuario existentes.

Los catálogos globales excluidos son `TaskType`, `TaskStatus`, `Source`, `LifeArea`, `Priority`, `ContactType` y `MemoryType`.

`Principal` y `Colaborador` reciben todos los permisos operativos de LifeOps y Google, sin permisos sobre esos catálogos. Principal agrega gestión de usuarios y lectura de roles, con Colaborador como único child role; no tiene cambio de tenant ni modificación de roles. Un hook local valida asignación de roles y pertenencia al tenant en las rutas administrativas de usuarios porque la versión instalada de Drax solo utiliza childRoles para filtrar la lista de roles.

## Antes de desplegar sobre datos existentes

1. Respaldar la base de datos.
2. Crear/asignar tenants a los usuarios y completar el tenant de sus datos operativos. No se infiere automáticamente a qué tenant pertenecen los registros históricos compartidos.
3. Revisar el índice único de `DayPlan`: ahora es `{tenant: 1, user: 1, date: 1}`. El cambio de schema no elimina el índice anterior `{user: 1, date: 1}`; migrarlo explícitamente después de verificar los datos. En SQLite verificar también la incorporación de columnas a tablas existentes.
4. Ejecutar el setup habitual para crear/actualizar Colaborador y luego Principal.
5. Reasignar usuarios que aún tengan Operator/Supervisor y eliminar esos roles persistidos una vez verificadas las referencias. Las definiciones del scaffold se eliminaron del código; el setup no borra roles ni reasigna usuarios existentes automáticamente.
6. Renovar sesiones/tokens para reflejar roles, permisos y tenant actualizados.

## Límites de este cambio

- No implementa el registro público ni la creación automática de tenant y Principal.
- El login Google deja de referenciar Operator y utiliza Colaborador; su alta automática existente todavía no crea un tenant. No usar ese flujo como onboarding multi-tenant hasta implementar el registro previsto.
- La sincronización Google de contactos exige un usuario con tenant persistido y solo compara contactos del mismo usuario y tenant. Migrar los contactos históricos antes de sincronizar para evitar duplicarlos.
- Los controles estándar de Drax no son fail-closed ante un RBAC sin tenant y permiten algunas lecturas por ID de registros sin tenant. El backfill y la asignación de tenant a usuarios son necesarios; este cambio no garantiza aislamiento de datos históricos sin migrar.
- No se agrega validación de pertenencia al tenant para todas las referencias entre entidades. La configuración de los controllers no sustituye esa validación de relaciones.
