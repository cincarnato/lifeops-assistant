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
import BusinessPartnerProvider from "../providers/BusinessPartnerProvider";

//Import EntityCrud Refs
import ContactCrud from "./ContactCrud";
import {UserCrud} from "@drax/identity-vue"

class BusinessPartnerCrud extends EntityCrud implements IEntityCrud {

  static singleton: BusinessPartnerCrud

  constructor() {
    super();
    this.name = 'BusinessPartner'
  }

  static get instance(): BusinessPartnerCrud {
    if (!BusinessPartnerCrud.singleton) {
      BusinessPartnerCrud.singleton = new BusinessPartnerCrud()
    }
    return BusinessPartnerCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'businesspartner:manage',
      view: 'businesspartner:view',
      create: 'businesspartner:create',
      update: 'businesspartner:update',
      delete: 'businesspartner:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'name', key: 'name', align: 'start'},
      {title: 'roles', key: 'roles', align: 'start'},
      {title: 'priority', key: 'priority', align: 'start'},
      {title: 'mainContact', key: 'mainContact', align: 'start'},
// {title: 'user',key:'user', align: 'start'}
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
    return BusinessPartnerProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {
      Contact: ContactCrud.instance,
      User: UserCrud.instance
    }
  }

  get rules(): IEntityCrudRules {
    return {
      name: [(v: any) => !!v || 'validation.required'],
    }
  }

  get fields(): IEntityCrudField[] {
    return [
      {name: 'name', type: 'string', label: 'name', default: '', groupTab: 'BASIC', cols: 12, md: 8, lg: 8},
      {name: 'priority', type: 'string', label: 'priority', default: '', groupTab: 'BASIC', cols: 12, md: 4, lg: 4},
      {name: 'roles', type: 'array.enum', label: 'roles', default: [], enum: ['client', 'provider'], groupTab: 'BASIC', cols: 12, md: 6, lg: 6},
      {name: 'mainContact', type: 'ref', label: 'mainContact', default: null, ref: 'Contact', refDisplay: 'displayName', groupTab: 'BASIC', cols: 12, md: 6, lg: 6},
      {name: 'website', type: 'string', label: 'website', default: '', groupTab: 'BASIC', cols: 12, md: 6, lg: 6},
      {name: 'aliases', type: 'array.string', label: 'aliases', default: [], groupTab: 'BASIC', cols: 12, md: 6, lg: 6},
      {name: 'description', type: 'longString', label: 'description', default: '', rows: 3, groupTab: 'BASIC', cols: 12, md: 6, lg: 6},
      {name: 'notes', type: 'longString', label: 'notes', default: '', rows: 3, groupTab: 'BASIC', cols: 12, md: 6, lg: 6},
      {name: 'tags', type: 'array.string', label: 'tags', default: [], groupTab: 'BASIC', cols: 12, md: 6, lg: 6},
      {name: 'archivedAt', type: 'date', label: 'archivedAt', default: null, groupTab: 'BASIC', cols: 12, md: 6, lg: 6},
      {name: 'legalName', type: 'string', label: 'legalName', default: '', groupTab: 'FACTURACION', cols: 12, md: 6, lg: 6},
      {name: 'taxCondition', type: 'string', label: 'taxCondition', default: '', groupTab: 'FACTURACION', cols: 12, md: 6, lg: 6},
      {name: 'taxIdType', type: 'string', label: 'taxIdType', default: '', groupTab: 'FACTURACION', cols: 12, md: 6, lg: 6},
      {name: 'taxIdNumber', type: 'string', label: 'taxIdNumber', default: '', groupTab: 'FACTURACION', cols: 12, md: 6, lg: 6},
      {name: 'taxEmail', type: 'string', label: 'taxEmail', default: '', groupTab: 'FACTURACION', cols: 12, md: 12, lg: 12},
      {name: 'taxAddress', type: 'longString', label: 'taxAddress', default: '', rows: 2, groupTab: 'FACTURACION', cols: 12, md: 12, lg: 12}
// {name:'user',type:'ref',label:'user',default:null,ref: 'User',refDisplay: 'username'},
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
    return ['BASIC', 'FACTURACION']
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

export default BusinessPartnerCrud
