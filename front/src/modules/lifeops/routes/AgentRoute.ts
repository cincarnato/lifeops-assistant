
import AgentPage from "../pages/AgentPage.vue";
import AgentCinePage from "../pages/AgentCinePage.vue";


const AgentRoute = [
  {
    name: 'AgentPage',
    path: '/agent',
    component: AgentPage,
    meta: {
      auth: true,
      permission: 'agent:session',
      layout: 'base'
    }
  },
  {
    name: 'AgentCinePage',
    path: '/agentc',
    component: AgentCinePage,
    meta: {
      auth: true,
      permission: 'agent:session',
      layout: 'empty'
    }
  },
]

export default AgentRoute
export { AgentRoute }
