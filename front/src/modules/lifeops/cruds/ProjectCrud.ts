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
import GoalCrud from "./GoalCrud";
import ClientCrud from "./ClientCrud";
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
      {title: 'status', key: 'status', align: 'start'},
      {title: 'priority', key: 'priority', align: 'start'},
      {title: 'client', key: 'client', align: 'start'},
      {title: 'priorityScore', key: 'priorityScore', align: 'start'},
      {title: 'targetDate', key: 'targetDate', align: 'start'},
      {title: 'progressPercent', key: 'progressPercent', align: 'start'},
      {title: 'user', key: 'user', align: 'start'}
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
      Goal: GoalCrud.instance,
      Client: ClientCrud.instance,
      User: UserCrud.instance
    }
  }

  get rules(): IEntityCrudRules {
    return {
      name: [(v: any) => !!v || 'validation.required'],
      user: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[] {
    return [
      {name: 'name', type: 'string', label: 'name', default: ''},
      {name: 'description', type: 'longString', label: 'description', default: ''},
      {
        name: 'status',
        type: 'enum',
        label: 'status',
        default: 'idea',
        enum: ['idea', 'active', 'paused', 'completed', 'cancelled', 'archived']
      },
      {
        name: 'priority',
        type: 'enum',
        label: 'priority',
        default: 'medium',
        enum: ['low', 'medium', 'high', 'critical']
      },
      {name: 'goals', type: 'array.ref', label: 'goals', default: [], ref: 'Goal', refDisplay: 'name'},
      {name: 'client', type: 'ref', label: 'client', default: null, ref: 'Client', refDisplay: 'name'},
      {name: 'valueScore', type: 'number', label: 'valueScore', default: 5},
      {name: 'motivationScore', type: 'number', label: 'motivationScore', default: 5},
      {name: 'effortScore', type: 'number', label: 'effortScore', default: 5},
      {name: 'priorityScore', type: 'number', label: 'priorityScore', default: null},
      {name: 'startDate', type: 'date', label: 'startDate', default: null},
      {name: 'targetDate', type: 'date', label: 'targetDate', default: null},
      {name: 'completedAt', type: 'date', label: 'completedAt', default: null},
      {name: 'progressPercent', type: 'number', label: 'progressPercent', default: 0},
      {name: 'tags', type: 'array.string', label: 'tags', default: []},
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

export default ProjectCrud
