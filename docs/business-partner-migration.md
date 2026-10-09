# BusinessPartner

La entidad `BusinessPartner` representa una relación comercial como cliente, proveedor o ambos. Reemplaza a `Client` en backend, frontend y arquitectura.

- Collection MongoDB: `BusinessPartner`.
- API CRUD: `/api/business-partners`.
- Página CRUD: `/crud/business-partner`.
- Permisos: `businesspartner:create`, `businesspartner:update`, `businesspartner:delete`, `businesspartner:view` y `businesspartner:manage`.
- Relación de proyectos: `businessPartner`.
- Roles admitidos: `client` y `provider`, combinables. El valor inicial es `[]`.

## Migración automática

`back/src/setup/scripts/MigrateClientToBusinessPartner.ts` se ejecuta en cada setup con MongoDB, después de conectar y antes de inicializar el resto de la aplicación. También se ejecuta cuando el setup no carga datos iniciales.

La migración conserva los `_id`, fechas y demás campos. Inserta cada documento de `Client` en `BusinessPartner` usando un upsert por `_id` con `$setOnInsert`, por lo que no duplica documentos ni sobrescribe cambios en documentos ya migrados. Después de confirmar cada escritura elimina el documento de origen y, al completar la copia, elimina la collection `Client`. Si falla, el siguiente setup puede continuar desde los documentos pendientes.

Elimina los roles `none` y `prospect`. Los registros que únicamente tenían esos roles quedan con `roles: []`, sin asignarles automáticamente un rol comercial.

Renombra referencias antiguas `client` a `businessPartner` en `Project`, `Contact`, `Task` y `TaskArchived`, conservando el valor nuevo cuando ya existe. También convierte los permisos `client:*` de los roles de identidad existentes a `businesspartner:*` sin duplicarlos.

## Verificación

Desde `back/`:

```sh
npx vitest run test/modules/lifeops/business-partner/business-partner-migration.test.ts
```
