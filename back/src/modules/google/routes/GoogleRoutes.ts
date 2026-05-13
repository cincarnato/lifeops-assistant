
import GoogleController from "../controllers/GoogleController.js";

async function GoogleFastifyRoutes(fastify, options) {

    const controller: GoogleController = new GoogleController()

    fastify.post('/api/google/login', (req,rep) => controller.login(req,rep))

    fastify.post('/api/google/logout', (req,rep) => controller.logout(req,rep))

    fastify.get('/api/google/connections/permissions', (req,rep) => controller.connectionPermissions(req,rep))

    fastify.get('/api/google/connections/me', (req,rep) => controller.myConnections(req,rep))

    fastify.post('/api/google/connections/auth-url', (req,rep) => controller.connectionAuthorizationUrl(req,rep))

    fastify.post('/api/google/connections/callback', (req,rep) => controller.connectionCallback(req,rep))
}

export default GoogleFastifyRoutes;
export {GoogleFastifyRoutes}
