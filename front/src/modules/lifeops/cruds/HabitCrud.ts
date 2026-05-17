import {EntityCrud, useCrudStore} from "@drax/crud-vue";
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
import HabitProvider from "../providers/HabitProvider";

//Import EntityCrud Refs


class HabitCrud extends EntityCrud implements IEntityCrud {

  static singleton: HabitCrud
  private store

  constructor() {
    super();
    this.name = 'Habit'
    this.store = useCrudStore(this.name)
  }

  static get instance(): HabitCrud {
    if (!HabitCrud.singleton) {
      HabitCrud.singleton = new HabitCrud()
    }
    return HabitCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'habit:manage',
      view: 'habit:view',
      create: 'habit:create',
      update: 'habit:update',
      delete: 'habit:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'name', key: 'name', align: 'start'},
      {title: 'lifeArea', key: 'lifeArea', align: 'start'},
      {title: 'active', key: 'active', align: 'start'},
      {title: 'generateTask', key: 'generateTask', align: 'start'}
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
    return HabitProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {}
  }

  get rules(): IEntityCrudRules {
    return {
      name: [(v: any) => !!v || 'validation.required'],
      frequency: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[] {
    return [
      {name: 'name', type: 'string', label: 'name', default: ''},
      {name: 'description', type: 'longString', label: 'description', default: ''},
      {name: 'lifeArea', type: 'string', label: 'lifeArea', default: ''},
      {name: 'active', type: 'boolean', label: 'active', default: true},
      {
        name: 'frequency',
        type: 'object',
        label: 'frequency',
        default: {"type": null},
        objectFields: [{name: 'type', type: 'enum', label: 'type', default: null, enum: ['daily', 'weekly', 'monthly']}]
      },
      {name: 'generateTask', type: 'boolean', label: 'generateTask', default: false},
      {
        name: 'taskTemplate',
        type: 'object',
        label: 'taskTemplate',
        default: {"title": "", "description": "", "estimatedMinutes": null, "priority": ""},
        objectFields: [
          {name: 'title', type: 'string', label: 'title', default: ''},
          {name: 'description', type: 'longString', label: 'description', default: ''},
          {name: 'estimatedMinutes', type: 'number', label: 'estimatedMinutes', default: null},
          {name: 'priority', type: 'string', label: 'priority', default: ''}]
      }
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

export default HabitCrud
