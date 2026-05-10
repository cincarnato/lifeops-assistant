import ChatbotTaskPage from "../pages/ChatbotTaskPage.vue";

const ChatbotTaskRoute = [
  {
    name: 'ChatbotTaskPage',
    path: '/tasks/chatbot',
    component: ChatbotTaskPage,
    meta: {
      auth: true,
      permission: 'task:create',
    }
  },
]

export default ChatbotTaskRoute
export { ChatbotTaskRoute }
