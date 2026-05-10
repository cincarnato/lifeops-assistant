import {z} from "zod";
import {CommonController} from "@drax/common-back";
import ChatbotTaskServiceFactory from "../factory/services/ChatbotTaskServiceFactory.js";
import TaskPermissions from "../permissions/TaskPermissions.js";

const ChatbotTaskMessageSchema = z.object({
    sessionId: z.string().optional(),
    message: z.string().min(1, "validation.required"),
});

class ChatbotTaskController extends CommonController {
    async startSession(request, reply) {
        try {
            request.rbac.assertPermission(TaskPermissions.Create);

            const session = ChatbotTaskServiceFactory.instance.startSession(request.rbac.userId);

            return reply.send({
                sessionId: session.id,
            });
        } catch (e) {
            this.handleError(e, reply);
        }
    }

    async message(request, reply) {
        try {
            request.rbac.assertPermission(TaskPermissions.Create);

            const input = ChatbotTaskMessageSchema.parse(request.body ?? {});
            const response = await ChatbotTaskServiceFactory.instance.sendMessage({
                sessionId: input.sessionId,
                message: input.message,
                userId: request.rbac.userId,
                tenantId: request.rbac?.tenantId ?? null,
                ip: request.ip,
                userAgent: request.headers["user-agent"],
            });

            return reply.send(response);
        } catch (e: any) {
            if (e?.name === "ZodError") {
                return reply.status(400).send({
                    message: e?.message || "Chatbot task validation error",
                });
            }

            this.handleError(e, reply);
        }
    }
}

export default ChatbotTaskController;
export {ChatbotTaskController};
