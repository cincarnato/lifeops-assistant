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
import TaskProvider from "../providers/TaskProvider";

//Import EntityCrud Refs
import GoalCrud from "./GoalCrud";
import ProjectCrud from "./ProjectCrud";
import {UserCrud} from "@drax/identity-vue"

class TaskCrud extends EntityCrud implements IEntityCrud {

  static singleton: TaskCrud

  constructor() {
    super();
    this.name = 'Task'
  }

  static get instance(): TaskCrud {
    if (!TaskCrud.singleton) {
      TaskCrud.singleton = new TaskCrud()
    }
    return TaskCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'task:manage',
      view: 'task:view',
      create: 'task:create',
      update: 'task:update',
      delete: 'task:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'title', key: 'title', align: 'start'},
      {title: 'source', key: 'source', align: 'start'},
      {title: 'type', key: 'type', align: 'start'},
      {title: 'lifeArea', key: 'lifeArea', align: 'start'},
      {title: 'status', key: 'status', align: 'start'},
      {title: 'priority', key: 'priority', align: 'start'},
      {title: 'project', key: 'project', align: 'start'},
      {title: 'valueScore', key: 'valueScore', align: 'start'},
      {title: 'dueDate', key: 'dueDate', align: 'start'},
      {title: 'scheduledDate', key: 'scheduledDate', align: 'start'},
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
    return TaskProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {
      Goal: GoalCrud.instance,
      Project: ProjectCrud.instance,
      User: UserCrud.instance
    }
  }

  get rules(): IEntityCrudRules {
    return {
      title: [(v: any) => !!v || 'validation.required'],
      user: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[] {
    return [
      {name: 'title', type: 'string', label: 'title', default: '', sm: 6},
      {name: 'status', type: 'string', label: 'status', default: null, sm: 6},
      {name: 'description', type: 'longString', label: 'description', default: ''},
      {name: 'source', type: 'string', label: 'source', default: null, groupTab: 'CLASSIFICATION', sm: 4},
      {name: 'type', type: 'string', label: 'type', default: null, groupTab: 'CLASSIFICATION', sm: 4},
      {name: 'lifeArea', type: 'string', label: 'lifeArea', default: null, groupTab: 'CLASSIFICATION', sm: 4},
      {name: 'priority', type: 'string', label: 'priority', default: null, groupTab: 'CLASSIFICATION', sm: 4},
      {name: 'tags', type: 'array.string', label: 'tags', default: [], groupTab: 'CLASSIFICATION'},
      {
        name: 'goals',
        type: 'array.ref',
        label: 'goals',
        default: [],
        ref: 'Goal',
        refDisplay: 'name',
        groupTab: 'CONTEXT',
        addOnTheFly: true,
      },
      {
        name: 'project',
        type: 'ref',
        label: 'project',
        default: null,
        ref: 'Project',
        refDisplay: 'name',
        groupTab: 'CONTEXT',
        addOnTheFly: true,
      },
      {name: 'valueScore', type: 'number', label: 'valueScore', default: 5, groupTab: 'SCORING'},
      {name: 'motivationScore', type: 'number', label: 'motivationScore', default: 5, groupTab: 'SCORING'},
      {name: 'effortScore', type: 'number', label: 'effortScore', default: 5, groupTab: 'SCORING'},
      {name: 'urgencyScore', type: 'number', label: 'urgencyScore', default: 5, groupTab: 'SCORING'},
      {name: 'dueDate', type: 'date', label: 'dueDate', default: null, groupTab: 'SCHEDULE'},
      {name: 'scheduledDate', type: 'date', label: 'scheduledDate', default: null, groupTab: 'SCHEDULE'},
      // {name: 'completedAt', type: 'date', label: 'completedAt', default: null, groupTab: 'EXECUTION'},
      {
        name: 'notes',
        type: 'array.object',
        label: 'notes',
        default: [],
        groupTab: 'NOTES',
        arrayObjectUI: 'accordion',
        arrayObjectShowField: 'note',
        objectFields: [
          {name: 'date', type: 'date', label: 'date', default: null},
          {name: 'note', type: 'longString', label: 'note', default: ''}
        ]
      },
      {
        name: 'statusHistory',
        type: 'array.object',
        label: 'statusHistory',
        default: [],
        groupTab: 'HISTORY',
        arrayObjectUI: 'accordion',
        arrayObjectShowField: 'newStatus',
        objectFields: [
          {name: 'date', type: 'date', label: 'date', default: null},
          {name: 'previousStatus', type: 'string', label: 'previousStatus', default: ''},
          {name: 'newStatus', type: 'string', label: 'newStatus', default: ''}
        ]
      },

      {name: 'redmineIssueId', type: 'string', label: 'redmineIssueId', default: '', groupTab: 'INTEGRATIONS'},
      {name: 'emailMessageId', type: 'string', label: 'emailMessageId', default: '', groupTab: 'INTEGRATIONS'},
      {name: 'calendarEventId', type: 'string', label: 'calendarEventId', default: '', groupTab: 'INTEGRATIONS'},
      // {name: 'user', type: 'ref', label: 'user', default: null, ref: 'User', refDisplay: 'username'},
      {name: 'archivedAt', type: 'date', label: 'archivedAt', default: null, groupTab: 'EXECUTION'}
    ]
  }

  get createFields(): IEntityCrudField[] {
    return this.fields.filter(field => field.name !== 'statusHistory')
  }

  get updateFields(): IEntityCrudField[] {
    return this.fields.filter(field => field.name !== 'statusHistory')
  }

  get viewFields(): IEntityCrudField[] {
    return this.fields
  }

  get filters(): IEntityCrudFilter[] {
    return [
      {name: 'project', type: 'ref', label: 'project', default: null, operator: 'eq', ref: 'Project', refDisplay: 'name', cols: 12, sm: 4, md: 4, lg: 4, xl: 4},
      {name: 'goals', type: 'ref', label: 'goals', default: null, operator: 'eq', ref: 'Goal', refDisplay: 'name', cols: 12, sm: 4, md: 4, lg: 4, xl: 4},
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
    return ['CLASSIFICATION', 'CONTEXT', 'NOTES','HISTORY', 'SCORING', 'SCHEDULE', 'EXECUTION', 'INTEGRATIONS']
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

export default TaskCrud
