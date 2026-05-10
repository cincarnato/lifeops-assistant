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
import ClientCrud from "./ClientCrud";
import ContactCrud from "./ContactCrud";
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
      {title: 'status', key: 'status', align: 'start'},
      {title: 'priority', key: 'priority', align: 'start'},
      {title: 'project', key: 'project', align: 'start'},
      {title: 'client', key: 'client', align: 'start'},
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
      Client: ClientCrud.instance,
      Contact: ContactCrud.instance,
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
      {name: 'title', type: 'string', label: 'title', default: ''},
      {name: 'description', type: 'longString', label: 'description', default: ''},
      {name: 'source', type: 'string', label: 'source', default: '', groupTab: 'CLASSIFICATION'},
      {name: 'type', type: 'string', label: 'type', default: '', groupTab: 'CLASSIFICATION'},
      {name: 'status', type: 'string', label: 'status', default: '', groupTab: 'CLASSIFICATION'},
      {name: 'priority', type: 'string', label: 'priority', default: '', groupTab: 'CLASSIFICATION'},
      {name: 'goals', type: 'array.ref', label: 'goals', default: [], ref: 'Goal', refDisplay: 'name', groupTab: 'CONTEXT'},
      {name: 'project', type: 'ref', label: 'project', default: null, ref: 'Project', refDisplay: 'name', groupTab: 'CONTEXT'},
      {name: 'client', type: 'ref', label: 'client', default: null, ref: 'Client', refDisplay: 'name', groupTab: 'CONTEXT'},
      {name: 'contacts', type: 'array.ref', label: 'contacts', default: [], ref: 'Contact', refDisplay: 'displayName', groupTab: 'CONTEXT'},
      {name: 'valueScore', type: 'number', label: 'valueScore', default: 5, groupTab: 'SCORING'},
      {name: 'motivationScore', type: 'number', label: 'motivationScore', default: 5, groupTab: 'SCORING'},
      {name: 'effortScore', type: 'number', label: 'effortScore', default: 5, groupTab: 'SCORING'},
      {name: 'urgencyScore', type: 'number', label: 'urgencyScore', default: null, groupTab: 'SCORING'},
      {name: 'dueDate', type: 'date', label: 'dueDate', default: null, groupTab: 'SCHEDULE'},
      {name: 'scheduledDate', type: 'date', label: 'scheduledDate', default: null, groupTab: 'SCHEDULE'},
      {name: 'estimatedMinutes', type: 'number', label: 'estimatedMinutes', default: 1, groupTab: 'EXECUTION'},
      {name: 'spentMinutes', type: 'number', label: 'spentMinutes', default: 1, groupTab: 'EXECUTION'},
      {name: 'completedAt', type: 'date', label: 'completedAt', default: null, groupTab: 'EXECUTION'},
      {name: 'nextAction', type: 'string', label: 'nextAction', default: '', groupTab: 'EXECUTION'},
      {name: 'notes', type: 'longString', label: 'notes', default: '', groupTab: 'EXECUTION'},
      {name: 'tags', type: 'array.string', label: 'tags', default: [], groupTab: 'CLASSIFICATION'},
      {name: 'redmineIssueId', type: 'string', label: 'redmineIssueId', default: '', groupTab: 'INTEGRATIONS'},
      {name: 'emailMessageId', type: 'string', label: 'emailMessageId', default: '', groupTab: 'INTEGRATIONS'},
      {name: 'calendarEventId', type: 'string', label: 'calendarEventId', default: '', groupTab: 'INTEGRATIONS'},
      // {name: 'user', type: 'ref', label: 'user', default: null, ref: 'User', refDisplay: 'username'},
      {name: 'archivedAt', type: 'date', label: 'archivedAt', default: null, groupTab: 'EXECUTION'}
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
    return ['CLASSIFICATION', 'CONTEXT', 'SCORING', 'SCHEDULE', 'EXECUTION', 'INTEGRATIONS']
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
