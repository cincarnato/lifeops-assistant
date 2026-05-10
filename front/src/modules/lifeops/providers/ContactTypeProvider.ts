
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IContactType, IContactTypeBase} from '../interfaces/IContactType'

class ContactTypeProvider extends AbstractCrudRestProvider<IContactType, IContactTypeBase, IContactTypeBase> {
    
  static singleton: ContactTypeProvider
    
  constructor() {
   super('/api/contact-types')
  }
  
  static get instance() {
    if(!ContactTypeProvider.singleton){
      ContactTypeProvider.singleton = new ContactTypeProvider()
    }
    return ContactTypeProvider.singleton
  }

}

export default ContactTypeProvider

