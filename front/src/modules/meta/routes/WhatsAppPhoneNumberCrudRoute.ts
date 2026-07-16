
import WhatsAppPhoneNumberCrudPage from "../pages/crud/WhatsAppPhoneNumberCrudPage.vue";


const WhatsAppPhoneNumberCrudRoute = [
  {
    name: 'WhatsAppPhoneNumberCrudPage',
    path: '/crud/whatsappphonenumber',
    component: WhatsAppPhoneNumberCrudPage,
    meta: {
      auth: true,
      permission: 'whatsappphonenumber:manage',
    }
  },
]

export default WhatsAppPhoneNumberCrudRoute
export { WhatsAppPhoneNumberCrudRoute }
