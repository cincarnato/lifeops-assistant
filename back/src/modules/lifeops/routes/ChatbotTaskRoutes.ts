import ChatbotTaskController from "../controllers/ChatbotTaskController.js";

async function ChatbotTaskFastifyRoutes(fastify, options) {
    const controller = new ChatbotTaskController();

    fastify.post("/api/tasks/chatbot/session", (req, rep) => controller.startSession(req, rep));
    fastify.post("/api/tasks/chatbot/message", (req, rep) => controller.message(req, rep));
}

export default ChatbotTaskFastifyRoutes;
export {ChatbotTaskFastifyRoutes};
