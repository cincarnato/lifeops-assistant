
import ContactTypeCrudPage from "../pages/crud/ContactTypeCrudPage.vue";


const ContactTypeCrudRoute = [
  {
    name: 'ContactTypeCrudPage',
    path: '/crud/contacttype',
    component: ContactTypeCrudPage,
    meta: {
      auth: true,
      permission: 'contacttype:manage',
    }
  },
]

export default ContactTypeCrudRoute
export { ContactTypeCrudRoute }
