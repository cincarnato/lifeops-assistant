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
import CompanyProvider from "../providers/CompanyProvider";

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"

class CompanyCrud extends EntityCrud implements IEntityCrud {

  static singleton: CompanyCrud

  constructor() {
    super();
    this.name = 'Company'
  }

  static get instance(): CompanyCrud {
    if (!CompanyCrud.singleton) {
      CompanyCrud.singleton = new CompanyCrud()
    }
    return CompanyCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'company:manage',
      view: 'company:view',
      create: 'company:create',
      update: 'company:update',
      delete: 'company:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'name', key: 'name', align: 'start'},
      {title: 'type', key: 'type', align: 'start'},
      {title: 'status', key: 'status', align: 'start'},
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
    return CompanyProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {
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
      {name: 'name', type: 'string', label: 'name', default: ''},
      {name: 'legalName', type: 'string', label: 'legalName', default: ''},
      {name: 'taxIdType', type: 'string', label: 'taxIdType', default: ''},
      {name: 'taxIdNumber', type: 'string', label: 'taxIdNumber', default: ''},
      {name: 'description', type: 'longString', label: 'description', default: ''},
      {name: 'type', type: 'string', label: 'type', default: ''},
      {name: 'status', type: 'enum', label: 'status', default: 'active', enum: ['active', 'inactive', 'archived']},
      {name: 'website', type: 'string', label: 'website', default: ''},
      {name: 'emailDomains', type: 'array.string', label: 'emailDomains', default: []},
      {name: 'tags', type: 'array.string', label: 'tags', default: []},
      {name: 'notes', type: 'longString', label: 'notes', default: ''},
      {name: 'archivedAt', type: 'date', label: 'archivedAt', default: null}
      // {name: 'user', type: 'ref', label: 'user', default: null, ref: 'User', refDisplay: 'username'},
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

export default CompanyCrud
