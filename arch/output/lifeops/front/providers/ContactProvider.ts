
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IContact, IContactBase} from '../interfaces/IContact'

class ContactProvider extends AbstractCrudRestProvider<IContact, IContactBase, IContactBase> {
    
  static singleton: ContactProvider
    
  constructor() {
   super('/api/contacts')
  }
  
  static get instance() {
    if(!ContactProvider.singleton){
      ContactProvider.singleton = new ContactProvider()
    }
    return ContactProvider.singleton
  }

}

export default ContactProvider

