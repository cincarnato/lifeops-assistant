import ChatbotTaskService from "../../services/ChatbotTaskService.js";

class ChatbotTaskServiceFactory {
    private static service: ChatbotTaskService;

    public static get instance(): ChatbotTaskService {
        if (!ChatbotTaskServiceFactory.service) {
            ChatbotTaskServiceFactory.service = new ChatbotTaskService();
        }

        return ChatbotTaskServiceFactory.service;
    }
}

export default ChatbotTaskServiceFactory;
export {ChatbotTaskServiceFactory};
