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
import TaskScheduleProvider from "../providers/TaskScheduleProvider";

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"
import GoalCrud from "@/modules/lifeops/cruds/GoalCrud.js";
import ProjectCrud from "@/modules/lifeops/cruds/ProjectCrud.js";
import TaskCrud from "@/modules/lifeops/cruds/TaskCrud.js";

class TaskScheduleCrud extends EntityCrud implements IEntityCrud {

  static singleton: TaskScheduleCrud
  private readonly formInternalFields = ['runtime', 'user']
  private store

  constructor() {
    super();
    this.name = 'TaskSchedule'
    this.store = useCrudStore(this.name)
  }

  static get instance(): TaskScheduleCrud {
    if (!TaskScheduleCrud.singleton) {
      TaskScheduleCrud.singleton = new TaskScheduleCrud()
    }
    return TaskScheduleCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'taskschedule:manage',
      view: 'taskschedule:view',
      create: 'taskschedule:create',
      update: 'taskschedule:update',
      delete: 'taskschedule:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'name', key: 'name', align: 'start'},
      {title: 'active', key: 'active', align: 'start'},
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
    return TaskScheduleProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {
      Task: TaskCrud.instance,
      Goal: GoalCrud.instance,
      Project: ProjectCrud.instance,
      User: UserCrud.instance
    }
  }

  get rules(): IEntityCrudRules {
    return {
      name: [(v: any) => !!v || 'validation.required'],
      task: [(v: any) => !!v || 'validation.required'],
      schedule: [(v: any) => !!v || 'validation.required'],
      dueDateRule: [],
      runtime: []
    }
  }

  get fields(): IEntityCrudField[] {
    return [
      {name: 'name', type: 'string', label: 'name', default: '', groupTab: 'GENERAL'},
      {name: 'active', type: 'boolean', label: 'active', default: true, groupTab: 'GENERAL'},
      {
        name: 'task',
        type: 'object',
        label: 'task',
        default: {
          "title": "",
          "description": "",
          "source": null,
          "type": null,
          "lifeArea": null,
          "status": null,
          "priority": "",
          "goals": [],
          "project": null,
          "valueScore": null,
          "motivationScore": null,
          "effortScore": null,
          "urgencyScore": null,
          "tags": []
        },
        groupTab: 'TASK',
        objectFields: [{name: 'title', type: 'string', label: 'title', default: ''},
          {name: 'description', type: 'longString', label: 'description', default: ''},
          {name: 'source', type: 'string', label: 'source', default: ''},
          {name: 'type', type: 'string', label: 'type', default: ''},
          {name: 'lifeArea', type: 'string', label: 'lifeArea', default: ''},
          {name: 'status', type: 'string', label: 'status', default: ''},
          {name: 'priority', type: 'string', label: 'priority', default: ''},
          {name: 'goals', type: 'array.ref', label: 'goals', default: [], ref: 'Goal', refDisplay: 'name'},
          {name: 'project', type: 'ref', label: 'project', default: null, ref: 'Project', refDisplay: 'name'},
          {name: 'valueScore', type: 'number', label: 'valueScore', default: null},
          {name: 'motivationScore', type: 'number', label: 'motivationScore', default: null},
          {name: 'effortScore', type: 'number', label: 'effortScore', default: null},
          {name: 'urgencyScore', type: 'number', label: 'urgencyScore', default: null},
          {name: 'tags', type: 'array.string', label: 'tags', default: []}]
      },
      {
        name: 'schedule',
        type: 'object',
        label: 'schedule',
        default: {
          "type": null,
          "time": "",
          "timezone": "America/Argentina/Buenos_Aires",
          "interval": "{\"every\":null,\"unit\":null}",
          "daysOfWeek": [],
          "daysOfMonth": [],
          "monthsOfYear": [],
          "runAt": null,
          "monthlyMode": null
        },
        groupTab: 'SCHEDULE',
        objectFields: [{
          name: 'type',
          type: 'enum',
          label: 'type',
          default: null,
          enum: ['once', 'interval', 'daily', 'weekly', 'monthly', 'yearly']
        },
          {name: 'time', type: 'string', label: 'time', default: ''},
          {name: 'timezone', type: 'string', label: 'timezone', default: 'America/Argentina/Buenos_Aires'},
          {
            name: 'interval',
            type: 'object',
            label: 'interval',
            default: {"every": null, "unit": null},
            objectFields: [{name: 'every', type: 'number', label: 'every', default: null},
              {
                name: 'unit',
                type: 'enum',
                label: 'unit',
                default: null,
                enum: ['minutes', 'hours', 'days', 'weeks', 'months']
              }]
          },
          {
            name: 'daysOfWeek',
            type: 'array.enum',
            label: 'daysOfWeek',
            default: [],
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          },
          {name: 'daysOfMonth', type: 'array.number', label: 'daysOfMonth', default: []},
          {name: 'monthsOfYear', type: 'array.number', label: 'monthsOfYear', default: []},
          {name: 'runAt', type: 'date', label: 'runAt', default: null},
          {
            name: 'monthlyMode',
            type: 'enum',
            label: 'monthlyMode',
            default: null,
            enum: ['dayOfMonth', 'lastDayOfMonth']
          }]
      },
      {
        name: 'dueDateRule',
        type: 'object',
        label: 'dueDateRule',
        default: {"type": "none", "daysAfter": null},
        groupTab: 'DUE_DATE',
        objectFields: [{
          name: 'type',
          type: 'enum',
          label: 'type',
          default: 'none',
          enum: ['none', 'sameDay', 'daysAfter']
        },
          {name: 'daysAfter', type: 'number', label: 'daysAfter', default: null}]
      },
      {
        name: 'runtime',
        type: 'object',
        label: 'runtime',
        default: {"lastRunAt": null, "nextRunAt": null, "lastTaskId": null, "lastStatus": null, "lastError": ""},
        groupTab: 'RUNTIME',
        objectFields: [{name: 'lastRunAt', type: 'date', label: 'lastRunAt', default: null},
          {name: 'nextRunAt', type: 'date', label: 'nextRunAt', default: null},
          {name: 'lastTaskId', type: 'ref', label: 'lastTaskId', default: null, ref: 'Task', refDisplay: 'title'},
          {name: 'lastStatus', type: 'enum', label: 'lastStatus', default: null, enum: ['success', 'failed']},
          {name: 'lastError', type: 'longString', label: 'lastError', default: ''}]
      },
      {name: 'startAt', type: 'date', label: 'startAt', default: null, groupTab: 'GENERAL'},
      {name: 'endAt', type: 'date', label: 'endAt', default: null, groupTab: 'GENERAL'},
      {
        name: 'user',
        type: 'ref',
        label: 'user',
        default: null,
        groupTab: 'GENERAL',
        ref: 'User',
        refDisplay: 'username'
      }
    ]
  }

  get createFields(): IEntityCrudField[] {
    return this.fields.filter(field => !this.formInternalFields.includes(field.name))
  }

  get updateFields(): IEntityCrudField[] {
    return this.fields.filter(field => !this.formInternalFields.includes(field.name))
  }

  get viewFields(): IEntityCrudField[] {
    return this.fields
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
    return [
      'GENERAL', 'TASK', 'SCHEDULE', 'DUE_DATE', 'RUNTIME'
    ]
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

export default TaskScheduleCrud
