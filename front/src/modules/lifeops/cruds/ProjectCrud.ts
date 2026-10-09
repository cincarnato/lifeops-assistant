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
import ProjectProvider from "../providers/ProjectProvider";

//Import EntityCrud Refs

import BusinessPartnerCrud from "./BusinessPartnerCrud";
import {UserCrud} from "@drax/identity-vue"

class ProjectCrud extends EntityCrud implements IEntityCrud {

  static singleton: ProjectCrud

  constructor() {
    super();
    this.name = 'Project'
  }

  static get instance(): ProjectCrud {
    if (!ProjectCrud.singleton) {
      ProjectCrud.singleton = new ProjectCrud()
    }
    return ProjectCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'project:manage',
      view: 'project:view',
      create: 'project:create',
      update: 'project:update',
      delete: 'project:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'name', key: 'name', align: 'start'},
      {title: 'aliases', key: 'aliases', align: 'start'},
      {title: 'priority', key: 'priority', align: 'start'},
      {title: 'businessPartner', key: 'businessPartner', align: 'start'},
      {title: 'redmineProjectId', key: 'redmineProjectId', align: 'start'},
      {title: 'tags', key: 'tags', align: 'start'},
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
    return ProjectProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {

      BusinessPartner: BusinessPartnerCrud.instance,
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
      {name: 'name', type: 'string', label: 'name', default: '', cols: 12, md: 8, lg: 8},
      {name: 'priority', type: 'string', label: 'priority', default: '', cols: 12, md: 4, lg: 4},
      {name: 'businessPartner', type: 'ref', label: 'businessPartner', default: null, ref: 'BusinessPartner', refDisplay: 'name', cols: 12, md: 6, lg: 6},
      {name: 'redmineProjectId', type: 'string', label: 'redmineProjectId', default: '', cols: 12, md: 6, lg: 6},
      {name: 'description', type: 'longString', label: 'description', default: '', rows: 3, cols: 12, md: 12, lg: 12},
      {name: 'valueScore', type: 'number', label: 'valueScore', default: 5, cols: 12, md: 4, lg: 4},
      {name: 'motivationScore', type: 'number', label: 'motivationScore', default: 5, cols: 12, md: 4, lg: 4},
      {name: 'effortScore', type: 'number', label: 'effortScore', default: 5, cols: 12, md: 4, lg: 4},
      {name: 'aliases', type: 'array.string', label: 'aliases', default: [], cols: 12, md: 6, lg: 6},
      {name: 'tags', type: 'array.string', label: 'tags', default: [], cols: 12, md: 6, lg: 6},
      {name: 'archivedAt', type: 'date', label: 'archivedAt', default: null, cols: 12, md: 6, lg: 6}
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

export default ProjectCrud
