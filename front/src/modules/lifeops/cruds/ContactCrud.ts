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
      {title: 'displayName', key: 'displayName', align: 'start'},
      {title: 'source', key: 'source', align: 'start'},
      {title: 'status', key: 'status', align: 'start'},
      {title: 'emails', key: 'emails', align: 'start', sortable: false},
      {title: 'phones', key: 'phones', align: 'start', sortable: false},
      {title: 'organization', key: 'organization', align: 'start', sortable: false},
      {title: 'lastSyncedAt', key: 'lastSyncedAt', align: 'start'},
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
      User: UserCrud.instance
    }
  }

  get rules(): IEntityCrudRules {
    return {
      displayName: [(v: any) => !!v || 'validation.required'],
    }
  }

  get fields(): IEntityCrudField[] {
    return [

      {
        name: 'status',
        type: 'enum',
        label: 'status',
        default: 'active',
        enum: ['active', 'archived', 'deleted'],
        groupTab: 'BASIC'
      },
      {name: 'displayName', type: 'string', label: 'displayName', default: '', groupTab: 'BASIC'},
      {name: 'givenName', type: 'string', label: 'givenName', default: '', groupTab: 'BASIC'},
      {name: 'familyName', type: 'string', label: 'familyName', default: '', groupTab: 'BASIC'},
      {name: 'nickname', type: 'string', label: 'nickname', default: '', groupTab: 'BASIC'},
      {
        name: 'source',
        type: 'enum',
        label: 'source',
        default: 'manual',
        enum: ['manual', 'google', 'imported', 'api'],
        groupTab: 'BASIC'
      },
      {
        name: 'emails',
        type: 'array.object',
        label: 'emails',
        default: [],
        groupTab: 'CONTACT',
        objectFields: [
          {name: 'value', type: 'string', label: 'value', default: ''},
          {name: 'type', type: 'string', label: 'type', default: 'other'},
          {name: 'primary', type: 'boolean', label: 'primary', default: false},
          {name: 'displayName', type: 'string', label: 'displayName', default: ''},
        ]
      },
      {
        name: 'phones',
        type: 'array.object',
        label: 'phones',
        default: [],
        groupTab: 'CONTACT',
        objectFields: [
          {name: 'value', type: 'string', label: 'value', default: ''},
          {name: 'normalizedValue', type: 'string', label: 'normalizedValue', default: ''},
          {name: 'type', type: 'string', label: 'type', default: 'other'},
          {name: 'primary', type: 'boolean', label: 'primary', default: false},
        ]
      },
      {
        name: 'organization',
        type: 'object',
        label: 'organization',
        default: {name: '', title: '', department: '', domain: ''},
        groupTab: 'ORGANIZATION',
        objectFields: [
          {name: 'name', type: 'string', label: 'name', default: ''},
          {name: 'title', type: 'string', label: 'title', default: ''},
          {name: 'department', type: 'string', label: 'department', default: ''},
          {name: 'domain', type: 'string', label: 'domain', default: ''},
        ]
      },
      {
        name: 'addresses',
        type: 'array.object',
        label: 'addresses',
        default: [],
        groupTab: 'CONTACT',
        objectFields: [
          {name: 'formattedValue', type: 'string', label: 'formattedValue', default: ''},
          {name: 'type', type: 'string', label: 'type', default: 'other'},
          {name: 'streetAddress', type: 'string', label: 'streetAddress', default: ''},
          {name: 'city', type: 'string', label: 'city', default: ''},
          {name: 'region', type: 'string', label: 'region', default: ''},
          {name: 'postalCode', type: 'string', label: 'postalCode', default: ''},
          {name: 'country', type: 'string', label: 'country', default: ''},
          {name: 'countryCode', type: 'string', label: 'countryCode', default: ''},
          {name: 'primary', type: 'boolean', label: 'primary', default: false},
        ]
      },
      {name: 'photoUrl', type: 'string', label: 'photoUrl', default: '', groupTab: 'CONTACT'},
      {
        name: 'birthday',
        type: 'object',
        label: 'birthday',
        default: {year: null, month: null, day: null},
        groupTab: 'CONTACT',
        objectFields: [
          {name: 'year', type: 'number', label: 'year', default: null},
          {name: 'month', type: 'number', label: 'month', default: null},
          {name: 'day', type: 'number', label: 'day', default: null},
        ]
      },
      {name: 'tags', type: 'array.string', label: 'tags', default: [], groupTab: 'BASIC'},
      {name: 'notes', type: 'longString', label: 'notes', default: '', groupTab: 'BASIC'},
      {
        name: 'externalProvider',
        type: 'enum',
        label: 'externalProvider',
        default: null,
        enum: ['google'],
        groupTab: 'SYNC'
      },
      {name: 'externalId', type: 'string', label: 'externalId', default: '', groupTab: 'SYNC'},
      {name: 'externalEtag', type: 'string', label: 'externalEtag', default: '', groupTab: 'SYNC'},
      {name: 'externalRaw', type: 'object', label: 'externalRaw', default: null, groupTab: 'SYNC'},
      {name: 'lastSyncedAt', type: 'date', label: 'lastSyncedAt', default: null, groupTab: 'SYNC'},
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
    return ['BASIC', 'CONTACT', 'ORGANIZATION', 'SYNC']
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
