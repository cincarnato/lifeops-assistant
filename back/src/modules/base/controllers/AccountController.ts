import {UserServiceFactory} from "@drax/identity-back";
import GoogleConnectionServiceFactory from "../../google/factory/services/GoogleConnectionServiceFactory.js";

class AccountController {

    async deactivate(request, reply) {
        if (!request.authUser?.id) {
            return reply.code(401).send({error: "auth.required"});
        }

        const userId = request.authUser.id;
        const googleResult = await GoogleConnectionServiceFactory.instance.revokeUserConnections(userId);

        const userService = UserServiceFactory();
        await userService.updatePartial(userId, {
            active: false,
        } as any);

        return reply.send({
            success: true,
            googleConnectionsRevoked: googleResult.revoked,
            googleConnectionsFailed: googleResult.failed,
        });
    }

}

export default AccountController;
export {AccountController};
