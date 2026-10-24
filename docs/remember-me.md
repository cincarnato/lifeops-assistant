# Sesiones recordadas

## Integración

Se verificaron los paquetes instalados y lockfiles: `@drax/common-front`,
`@drax/identity-front`, `@drax/identity-vue` y `@drax/identity-back` están en
**3.68.0**; `@drax/identity-share` está en **3.67.0**, sin duplicación de los
singletons frontend revisados. No fue necesario actualizar dependencias.

- Pinia conserva `pinia-plugin-persistedstate`.
- `SetupAuth` delega en `setupAuthSession`; el arranque espera su finalización
  antes de cargar settings, registrar entidades e instalar el router.
- El guard espera `refreshAuthSession` antes de evaluar autenticación/permisos.
  Una sesión recordada recuperable que no puede validarse cancela la navegación
  protegida, sin borrar credenciales. Con el feature deshabilitado se conserva
  la redirección normal, aunque exista un refresh token antiguo.
- `IdentityLogin` ya incluye el checkbox inicialmente desmarcado, condicionado
  por la flag. Los cierres de sesión existentes usan `useAuth().logout()`.
- Los providers REST usan el cliente compartido y su preflight; no se agregó
  otro mecanismo de refresh/retry.
- El backend ya carga la configuración estándar y registra `UserRoutes`, con
  `/api/auth/refresh` y `/api/auth/logout` accesibles incluso con bearer vencido.
  El framework administra el almacenamiento privado; no se creó otro CRUD.

El proxy Vite existente mantiene `/api` hacia el backend. La integración es REST;
el login externo de Google conserva su flujo normal con `loginWithToken`, sin
agregarle sesiones extendidas. No se afirma soporte de renovación GraphQL/OAuth.

## Login con Google: remember-me no disponible en Drax 3.68.0

La revisión del código instalado y del registro npm confirmó que la última
versión publicada de `@drax/identity-back` y `@drax/identity-vue` consultada es
3.68.0. Activar ambas flags **no extiende las sesiones iniciadas con Google**.

El flujo actual tiene tres limitaciones:

1. `GoogleLogin.vue` no envía una elección remember-me. El checkbox de
   `IdentityLogin` es estado privado del formulario de usuario/contraseña; no
   afecta al botón de Google que está fuera de ese componente.
2. `GoogleController.login()` usa `UserService.authByEmail()`. Esa API no acepta
   `rememberMe`, genera una sesión normal y devuelve solo `accessToken`, incluso
   con `DRAX_REMEMBER_ME_ENABLED=true`.
3. `GoogleProvider.login()` llama a `useAuth().loginWithToken(accessToken)`.
   Esa API limpia la sesión anterior y no acepta `refreshToken` ni
   `refreshExpiresAt`. Por eso, aun agregando esos campos a la respuesta, no
   quedarían integrados automáticamente en la sesión recordada.

### Actualización necesaria en Drax

Antes de modificar la aplicación consumidora se necesita una release que:

- Agregue opt-in explícito a `authByEmail`, conservando el comportamiento normal
  por defecto y reutilizando la emisión privada de sesiones del framework. Debe
  obtener de BD los datos actuales, incluido el hash de contraseña requerido
  para vincular el refresh token, sin exponerlo al cliente.
- Exponga un workflow frontend para login externo con la respuesta completa de
  sesión. Debe sincronizar headers, persistir credenciales, cargar el perfil,
  coordinar cancelación/logout y revocar resultados tardíos, como el login
  estándar. No alcanza con escribir los tokens directamente en el store.

Con esa release publicada, actualizar paquetes/lockfiles de forma coherente,
conectar `IdentityRememberMe` (inicialmente desmarcado) al botón de Google,
validar con Zod el opt-in del endpoint y pasar la respuesta completa al workflow
público. Probar luego restauración, rotación, rechazo, logout y concurrencia.
No se agregó un checkbox sin efecto ni una implementación paralela de refresh.
El login Google normal sigue disponible, pero al expirar su JWT necesita un
nuevo inicio de sesión; la renovación de tokens de conexiones Gmail/Calendar es
un mecanismo distinto y no mantiene la sesión de Drax.

La prueba `back/test/modules/google/google-login.test.ts` ejecuta también el
`authByEmail` real instalado (simulando persistencia y firma) con la flag activa
e inactiva para caracterizar esta limitación. No reemplaza una prueba OAuth de
navegador ni verifica la rotación de refresh tokens.

## Entorno y despliegue

Las variables fueron configuradas por el usuario; no se leyeron ni modificaron
archivos privados:

- Backend runtime: `DRAX_REMEMBER_ME_ENABLED=true`.
- Backend opcional: `DRAX_REFRESH_TOKEN_TTL_SECONDS=2592000` (30 días por defecto,
  entero positivo; vencimiento absoluto, no se prolonga al renovar).
- Frontend build: `VITE_DRAX_REMEMBER_ME_ENABLED=true`.

Desplegar primero el backend compatible, aplicar su entorno y reiniciarlo;
después reconstruir y desplegar el frontend. No se modifica la duración del JWT.
Comprobar permisos de escritura/creación del almacenamiento privado según el
motor de BD y mantener el respaldo habitual; no requiere migraciones destructivas.

El usuario debe iniciar sesión nuevamente y marcar la opción: las sesiones
normales existentes no se convierten automáticamente.

## Consideraciones

- La persistencia actual guarda credenciales sensibles en `localStorage`, no en
  cookies HttpOnly. Son necesarios HTTPS y protección contra XSS.
- Web Locks coordina pestañas cuando está disponible; sin esa API solo se
  garantiza una renovación simultánea por pestaña.
- La renovación vuelve al tenant actualmente asignado en BD, no necesariamente
  al elegido anteriormente mediante `switchTenant`.
- Deshabilitar la flag bloquea nuevas emisiones/renovaciones, pero no revoca JWT
  ya emitidos ni borra tokens persistidos. Reactivarla puede permitir usar refresh
  tokens aún vigentes; no equivale a una revocación masiva.
- Logout limpia localmente incluso sin red; la revocación remota requiere que
  el backend sea alcanzable. Los JWT emitidos siguen válidos hasta expirar.

## Validación

Ejecutar desde `front/`:

```sh
node test/auth-session.assertions.mjs
npm run build
```

Las assertions focalizadas usan dobles de Identity/router para comprobar espera
antes de decidir acceso, permisos, rechazo, fallo transitorio, rutas públicas,
flag deshabilitada con credenciales antiguas y orden del bootstrap. No sustituyen
pruebas de integración de red ni prueban internamente la rotación del framework.

Ejecutar desde `back/`:

```sh
node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit --incremental false
```

Pendiente con usuario/BD de prueba seguros y navegador:

1. Flags deshabilitadas: checkbox oculto y login sin extensión.
2. Flag habilitada sin marcar: JWT normal sin renovación.
3. Marcar la opción: persistencia de sesión/perfil; recarga con JWT vencido antes
   del guard y de cargas iniciales.
4. Peticiones concurrentes y pestañas: una rotación coordinada y headers nuevos,
   sin bloqueo de `/me`.
5. Tokens vencidos/revocados/reutilizados y usuario inactivo: limpieza sin bucles.
6. Offline/perfil ausente: conservar credenciales, cancelar navegación protegida
   y permitir reintentar al recuperar red, sin rotación extra con JWT fresco.
7. Logout, incluida otra pestaña y respuestas tardías: limpieza y revocación sin
   restaurar la sesión.
8. Permisos actuales y tenant tras renovar.

No usar credenciales productivas ni registrar tokens/headers en estas pruebas.
