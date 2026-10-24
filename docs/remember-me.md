# Sesiones recordadas

## Integración

Se verificaron los paquetes instalados y lockfiles actualizados por el usuario:
`@drax/identity-vue` y `@drax/identity-back` están en **3.69.0**;
`@drax/common-front` y `@drax/identity-front`, en **3.68.0**;
`@drax/identity-share`, en **3.67.0**, sin duplicación de los singletons frontend
revisados. Las APIs de login externo necesarias están disponibles.

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

El proxy Vite existente mantiene `/api` hacia el backend. La integración de
sesiones Drax es REST, incluido el login externo Google. No se afirma soporte
de preflight/renovación GraphQL.

## Login con Google (Drax Identity 3.69.0)

- `GoogleLogin.vue` tiene su propio `IdentityRememberMe`, inicialmente
  desmarcado y oculto por Drax si la flag frontend está deshabilitada. Es
  independiente del checkbox del formulario de usuario/contraseña.
- Al recibir la credencial de Google, inicia el intercambio HTTP dentro de
  `useAuth().loginWithSession(operation, rememberMe)`. El callback envía el opt-in
  efectivo calculado por Drax; no inicia la petición antes del workflow.
- `GoogleProvider.login()` es solo transporte: devuelve `ILoginResponse` completa
  y omite Authorization en el intercambio. No escribe tokens ni headers; Drax
  confirma y persiste la sesión, sincroniza headers y carga el perfil.
- `GoogleLoginSchema` valida `credential` y el booleano opcional `rememberMe`
  sin coerción. Las entradas inválidas reciben 400.
- `GoogleAuthService` verifica la credencial con `google-auth-library`, exige
  `GOOGLE_CLIENT_ID` como audience y requiere un email verificado. Credenciales
  inválidas se rechazan con 401 antes de autenticar/registrar en Drax.
- `GoogleController` pasa el quinto argumento `rememberMe === true` a
  `authByEmail()` tanto en registro con tenant como en el flujo normal. Devuelve
  la respuesta completa. Roles y tenant iniciales siguen siendo política del
  servidor; no se aceptan del cliente.
- Con opt-in y flag backend activa se emiten refreshToken/refreshExpiresAt.
  Sin marcar, o con flag backend deshabilitada, sigue siendo un login normal.
  Bootstrap, guard, preflight y logout reutilizan la integración existente.
- La navegación a home solo ocurre si el workflow confirma el login. Un rechazo
  o cancelación muestra un error traducido sin registrar credenciales. Logout
  durante el intercambio/perfil no debe restaurar la sesión tardíamente.

Los refresh tokens de Drax mantienen la sesión de la aplicación: no son tokens
OAuth de Google ni autorizan Gmail/Calendar. El consentimiento y renovación de
las conexiones de Google son mecanismos independientes.

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
node test/login-session.assertions.mjs
node test/google-login.assertions.mjs
npm run build
```

Las assertions focalizadas usan dobles de Identity/router para comprobar espera
antes de decidir acceso, permisos, rechazo, fallo transitorio, rutas públicas,
flag deshabilitada con credenciales antiguas y orden del bootstrap. No sustituyen
pruebas de integración de red ni prueban internamente la rotación del framework.

Las assertions de Google ejecutan el componente, provider y workflow/store/
cliente REST instalados de Drax, con red y contexto de navegador simulados:
opt-in/flags, persistencia y headers, cancelación por logout durante intercambio,
fallo de perfil, restauración con JWT vencido y preflight concurrente. No montan
la UI ni prueban GIS en navegador o coordinación real entre pestañas.

Ejecutar desde `back/`:

```sh
npx --no-install vitest run test/modules/google/google-login.test.ts
node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit --incremental false
```

Los tests Google cubren el contrato del endpoint, registro con/sin tenant,
validación de credenciales y emisión opt-in con servicios Drax reales y
persistencia simulada. No usan BD productiva ni llamadas reales a Google.

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
