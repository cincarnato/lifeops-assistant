
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IWhatsAppPhoneNumber, IWhatsAppPhoneNumberBase} from '../interfaces/IWhatsAppPhoneNumber'

class WhatsAppPhoneNumberProvider extends AbstractCrudRestProvider<IWhatsAppPhoneNumber, IWhatsAppPhoneNumberBase, IWhatsAppPhoneNumberBase> {
    
  static singleton: WhatsAppPhoneNumberProvider
    
  constructor() {
   super('/api/whatsapp-phone-numbers')
  }
  
  static get instance() {
    if(!WhatsAppPhoneNumberProvider.singleton){
      WhatsAppPhoneNumberProvider.singleton = new WhatsAppPhoneNumberProvider()
    }
    return WhatsAppPhoneNumberProvider.singleton
  }

}

export default WhatsAppPhoneNumberProvider

