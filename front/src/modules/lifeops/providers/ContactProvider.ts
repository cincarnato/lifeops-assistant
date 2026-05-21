
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

  async syncGoogle(id: string): Promise<IContact> {
    return await this.httpClient.post(`${this.basePath}/${id}/sync-google`, {}, {timeout: 120000}) as IContact
  }

}

export default ContactProvider
