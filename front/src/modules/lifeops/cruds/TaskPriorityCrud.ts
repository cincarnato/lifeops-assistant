import {EntityCrud} from "@drax/crud-vue";
import type {
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader,
  IEntityCrudPermissions,
  IEntityCrudRefs,
  IEntityCrudRules
} from "@drax/crud-share";
import TaskPriorityProvider from "../providers/TaskPriorityProvider";

//Import EntityCrud Refs


class TaskPriorityCrud extends EntityCrud implements IEntityCrud {

  static singleton: TaskPriorityCrud

  constructor() {
    super();
    this.name = 'TaskPriority'
  }

  static get instance(): TaskPriorityCrud {
    if (!TaskPriorityCrud.singleton) {
      TaskPriorityCrud.singleton = new TaskPriorityCrud()
    }
    return TaskPriorityCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'taskpriority:manage',
      view: 'taskpriority:view',
      create: 'taskpriority:create',
      update: 'taskpriority:update',
      delete: 'taskpriority:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'name', key: 'name', align: 'start'}
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
    return TaskPriorityProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {}
  }

  get rules(): IEntityCrudRules {
    return {
      name: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[] {
    return [
      {name: 'name', type: 'string', label: 'name', default: ''},
      {name: 'description', type: 'longString', label: 'description', default: ''}
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

  get isSavedQueriesEnabled() {
    return true
  }

}

export default TaskPriorityCrud
