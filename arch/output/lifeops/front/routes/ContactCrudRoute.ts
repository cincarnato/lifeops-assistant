
import ContactCrudPage from "../pages/crud/ContactCrudPage.vue";


const ContactCrudRoute = [
  {
    name: 'ContactCrudPage',
    path: '/crud/contact',
    component: ContactCrudPage,
    meta: {
      auth: true,
      permission: 'contact:manage',
    }
  },
]

export default ContactCrudRoute
export { ContactCrudRoute }
