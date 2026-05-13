import GoogleAuthServiceFactory from "../factory/GoogleAuthServiceFactory.js";
import {BadCredentialsError, RoleServiceFactory, UserServiceFactory} from "@drax/identity-back";
import GoogleConnectionManagerFactory from "../factory/GoogleConnectionManagerFactory.js";
import GoogleConnectionServiceFactory from "../factory/services/GoogleConnectionServiceFactory.js";

class GoogleController {

    constructor() {

    }

    async login(request, reply) {

        try{
            const { credential } = request.body
            const payload = await GoogleAuthServiceFactory.instance.validateToken(credential)
            const userService = UserServiceFactory()
            const roleService = RoleServiceFactory()
            const role = await roleService.findByName('Operator')

            if(!role){
                throw new Error('Role not found')
            }

            const userData = {
                email: payload.email,
                username: payload.name.replace(' ', ''),
                name: payload.name,
                avatar: payload.picture,
                role: role.id,
                active: true,
                phone: '',
                password: undefined,
                origin: 'Google'
            }
            const userAgent = request.headers['user-agent']
            const ip = request.ip
            return await userService.authByEmail(payload.email,true, userData, { userAgent, ip })


        }catch (e){
            console.error('/api/google/login error', e)
            if (e instanceof BadCredentialsError) {
                reply.code(401)
                reply.send({error: e.message})
            }
            reply.code(500)
            reply.send({error: 'error.server'})
        }

    }

    async logout(request, reply) {

    }

    async connectionPermissions(request, reply) {
        reply.send({
            permissions: GoogleConnectionManagerFactory.instance.getAvailablePermissions(),
        });
    }

    async connectionAuthorizationUrl(request, reply) {
        try {
            if (!request.authUser?.id) {
                reply.code(401);
                return reply.send({error: "error.unauthorized"});
            }

            const {permissions = [], scopes = [], redirectUri, state} = request.body;

            if (!redirectUri) {
                reply.code(400);
                return reply.send({error: "google.redirect_uri.required"});
            }

            const authorizationUrl = GoogleConnectionManagerFactory.instance.createAuthorizationUrl({
                permissions,
                scopes,
                redirectUri,
                state,
            });

            reply.send({authorizationUrl});
        } catch (e) {
            console.error("/api/google/connections/auth-url error", e);
            reply.code(500);
            reply.send({error: "error.server"});
        }
    }

    async connectionCallback(request, reply) {
        try {
            if (!request.authUser?.id) {
                reply.code(401);
                return reply.send({error: "error.unauthorized"});
            }

            const {code, redirectUri} = request.body;

            if (!code || !redirectUri) {
                reply.code(400);
                return reply.send({error: "google.authorization_code.required"});
            }

            const connection = await GoogleConnectionManagerFactory.instance.connectWithCode({
                code,
                redirectUri,
                userId: request.authUser.id,
            });

            reply.send({connection});
        } catch (e) {
            console.error("/api/google/connections/callback error", e);
            reply.code(500);
            reply.send({error: e?.message || "error.server"});
        }
    }

    async myConnections(request, reply) {
        try {
            if (!request.authUser?.id) {
                reply.code(401);
                return reply.send({error: "error.unauthorized"});
            }

            const connections = await GoogleConnectionServiceFactory.instance.findBy("userId", request.authUser.id, 20);
            reply.send({connections: connections || []});
        } catch (e) {
            console.error("/api/google/connections/me error", e);
            reply.code(500);
            reply.send({error: "error.server"});
        }
    }


}

export default GoogleController;
export {
    GoogleController
}
