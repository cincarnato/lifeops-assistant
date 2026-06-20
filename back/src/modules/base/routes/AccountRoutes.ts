import AccountController from "../controllers/AccountController.js";

async function AccountRoutes(fastify, options) {
    const controller = new AccountController();

    fastify.post('/api/account/deactivate', (req, rep) => controller.deactivate(req, rep));
}

export default AccountRoutes;
export {AccountRoutes};
