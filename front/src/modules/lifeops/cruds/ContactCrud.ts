import {EntityCrud} from "@drax/crud-vue";
import type {
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader,
  IEntityCrudOperation,
  IEntityCrudPermissions,
  IEntityCrudRefs,
  IEntityCrudRules
} from "@drax/crud-share";
import ContactProvider from "../providers/ContactProvider";

//Import EntityCrud Refs
import ClientCrud from "./ClientCrud";
import CompanyCrud from "./CompanyCrud";
import {UserCrud} from "@drax/identity-vue"

class ContactCrud extends EntityCrud implements IEntityCrud {

  static singleton: ContactCrud

  constructor() {
    super();
    this.name = 'Contact'
  }

  static get instance(): ContactCrud {
    if (!ContactCrud.singleton) {
      ContactCrud.singleton = new ContactCrud()
    }
    return ContactCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'contact:manage',
      view: 'contact:view',
      create: 'contact:create',
      update: 'contact:update',
      delete: 'contact:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'firstName', key: 'firstName', align: 'start'},
      {title: 'lastName', key: 'lastName', align: 'start'},
      {title: 'displayName', key: 'displayName', align: 'start'},
      {title: 'type', key: 'type', align: 'start'},
      {title: 'priority', key: 'priority', align: 'start'},
      {title: 'client', key: 'client', align: 'start'},
      {title: 'company', key: 'company', align: 'start'},
      // {title: 'user', key: 'user', align: 'start'}
    ]
  }

  get selectedHeaders(): string[] {
    return this.headers.map(header => header.key)
  }

  get actionHeaders(): IEntityCrudHeader[] {
    return [
      {
        title: 'action.actions',
        key: 'actions',
        sortable: false,
        align: 'center',
        minWidth: '190px',
        fixed: 'end'
      },
    ]
  }

  get provider(): IDraxCrudProvider<any, any, any> {
    return ContactProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {
      Client: ClientCrud.instance,
      Company: CompanyCrud.instance,
      User: UserCrud.instance
    }
  }

  get rules(): IEntityCrudRules {
    return {
      firstName: [(v: any) => !!v || 'validation.required'],
      displayName: [(v: any) => !!v || 'validation.required'],
    }
  }

  get fields(): IEntityCrudField[] {
    return [
      {name: 'firstName', type: 'string', label: 'firstName', default: ''},
      {name: 'lastName', type: 'string', label: 'lastName', default: ''},
      {name: 'displayName', type: 'string', label: 'displayName', default: ''},
      {name: 'aliases', type: 'array.string', label: 'aliases', default: []},
      {name: 'type', type: 'string', label: 'type', default: ''},
      {
        name: 'priority',
        type: 'string',
        label: 'priority',
        default: ''
      },
      {name: 'client', type: 'ref', label: 'client', default: null, ref: 'Client', refDisplay: 'name'},
      {name: 'company', type: 'ref', label: 'company', default: null, ref: 'Company', refDisplay: 'name'},
      {name: 'jobTitle', type: 'string', label: 'jobTitle', default: ''},
      {name: 'department', type: 'string', label: 'department', default: ''},
      {name: 'emails', type: 'array.string', label: 'emails', default: []},
      {name: 'phones', type: 'array.string', label: 'phones', default: []},
      {name: 'valueScore', type: 'number', label: 'valueScore', default: null},
      {name: 'relationshipScore', type: 'number', label: 'relationshipScore', default: null},
      {name: 'tags', type: 'array.string', label: 'tags', default: []},
      {name: 'notes', type: 'longString', label: 'notes', default: ''},
      // {name: 'user', type: 'ref', label: 'user', default: null, ref: 'User', refDisplay: 'username'},
      {name: 'archivedAt', type: 'date', label: 'archivedAt', default: null}
    ]
  }

  get filters(): IEntityCrudFilter[] {
    return [
      //{name: '_id', type: 'string', label: 'ID', default: '', operator: 'eq' },
    ]
  }

  get isViewable() {
    return true
  }

  get isEditable() {
    return true
  }

  get isCreatable() {
    return true
  }

  get isDeletable() {
    return true
  }

  get isExportable() {
    return true
  }

  get exportFormats() {
    return ['CSV', 'JSON']
  }

  get exportHeaders() {
    return ['_id']
  }

  get isImportable() {
    return false
  }

  get isColumnSelectable() {
    return true
  }

  get isGroupable() {
    return true
  }

  get importFormats() {
    return ['CSV', 'JSON']
  }

  get dialogFullscreen() {
    return false
  }

  get tabs() {
    return []
  }

  get menus() {
    return []
  }

  get searchEnable() {
    return true
  }

  get filtersEnable() {
    return true
  }

  get dynamicFiltersEnable() {
    return true
  }

  get isAiAssistable() {
    return false
  }

  get navigationOperations(): IEntityCrudOperation[] {
    return ['view'] // edit, delete
  }

  get isSavedQueriesEnabled() {
    return true
  }

}

export default ContactCrud
