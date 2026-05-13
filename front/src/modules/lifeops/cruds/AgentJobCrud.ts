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
import AgentJobProvider from "../providers/AgentJobProvider";

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"

class AgentJobCrud extends EntityCrud implements IEntityCrud {

  static singleton: AgentJobCrud

  constructor() {
    super();
    this.name = 'AgentJob'
  }

  static get instance(): AgentJobCrud {
    if (!AgentJobCrud.singleton) {
      AgentJobCrud.singleton = new AgentJobCrud()
    }
    return AgentJobCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'agentjob:manage',
      view: 'agentjob:view',
      create: 'agentjob:create',
      update: 'agentjob:update',
      delete: 'agentjob:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'name', key: 'name', align: 'start'},
      {title: 'active', key: 'active', align: 'start'},
      {title: 'runtime.lastRunAt', key: 'runtime.lastRunAt', align: 'start'},
      {title: 'runtime.nextRunAt', key: 'runtime.nextRunAt', align: 'start'},
      {title: 'runtime.lastStatus', key: 'runtime.lastStatus', align: 'start'},
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
    return AgentJobProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {
      User: UserCrud.instance
    }
  }

  get rules(): IEntityCrudRules {
    return {
      name: [(v: any) => !!v || 'validation.required'],
      agent: [(v: any) => !!v || 'validation.required'],
      schedule: [(v: any) => !!v || 'validation.required'],
      execution: [],
      runtime: []
    }
  }

  get fields(): IEntityCrudField[] {
    return [
      {name: 'name', type: 'string', label: 'name', default: '', groupTab: 'GENERAL'},
      {name: 'description', type: 'longString', label: 'description', default: '', groupTab: 'GENERAL'},
      {name: 'active', type: 'boolean', label: 'active', default: true, groupTab: 'GENERAL'},
      {
        name: 'agent',
        type: 'object',
        label: 'agent',
        default: {"systemPrompt": "", "allowedTools": []},
        groupTab: 'AGENT',
        objectFields: [{name: 'systemPrompt', type: 'longString', label: 'systemPrompt', default: ''},
          {name: 'allowedTools', type: 'array.string', label: 'allowedTools', default: []}]
      },
      {
        name: 'schedule',
        type: 'object',
        label: 'schedule',
        default: {
          "type": null,
          "timezone": "America/Argentina/Buenos_Aires",
          "runAt": null,
          "time": "",
          "daysOfWeek": [],
          "daysOfMonth": [],
          "interval": {"every": null, "unit": null},
          "cronExpression": ""
        },
        groupTab: 'SCHEDULE',
        objectFields: [{
          name: 'type',
          type: 'enum',
          label: 'type',
          default: null,
          enum: ['once', 'daily', 'weekly', 'monthly', 'interval', 'cron']
        },
          {name: 'timezone', type: 'string', label: 'timezone', default: 'America/Argentina/Buenos_Aires'},
          {name: 'runAt', type: 'date', label: 'runAt', default: null},
          {name: 'time', type: 'string', label: 'time', default: ''},
          {
            name: 'daysOfWeek',
            type: 'array.enum',
            label: 'daysOfWeek',
            default: [],
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          },
          {name: 'daysOfMonth', type: 'array.number', label: 'daysOfMonth', default: []},
          {
            name: 'interval',
            type: 'object',
            label: 'interval',
            default: {"every": null, "unit": null},
            objectFields: [{name: 'every', type: 'number', label: 'every', default: null},
              {name: 'unit', type: 'enum', label: 'unit', default: null, enum: ['minutes', 'hours', 'days']}]
          },
          {name: 'cronExpression', type: 'string', label: 'cronExpression', default: ''}]
      },
      {
        name: 'execution',
        type: 'object',
        label: 'execution',
        default: {"timeoutSeconds": 300, "maxRetries": 0},
        groupTab: 'EXECUTION',
        objectFields: [{name: 'timeoutSeconds', type: 'number', label: 'timeoutSeconds', default: 300},
          {name: 'maxRetries', type: 'number', label: 'maxRetries', default: 0}]
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
    return [
      'GENERAL', 'AGENT', 'SCHEDULE', 'EXECUTION', 'RUNTIME'
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

export default AgentJobCrud
