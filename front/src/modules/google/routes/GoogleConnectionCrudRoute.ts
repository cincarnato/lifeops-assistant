
import GoogleConnectionCrudPage from "../pages/crud/GoogleConnectionCrudPage.vue";


const GoogleConnectionCrudRoute = [
  {
    name: 'GoogleConnectionCrudPage',
    path: '/crud/googleconnection',
    component: GoogleConnectionCrudPage,
    meta: {
      auth: true,
      permission: 'googleconnection:manage',
    }
  },
]

export default GoogleConnectionCrudRoute
export { GoogleConnectionCrudRoute }
