
import {EntityCrud} from "@drax/crud-vue";
import type{
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
import AgentJobExecutionProvider from "../providers/AgentJobExecutionProvider";

//Import EntityCrud Refs
import AgentJobCrud from "./AgentJobCrud";

class AgentJobExecutionCrud extends EntityCrud implements IEntityCrud {

  static singleton: AgentJobExecutionCrud

  constructor() {
    super();
    this.name = 'AgentJobExecution'
  }
  
  static get instance(): AgentJobExecutionCrud {
    if(!AgentJobExecutionCrud.singleton){
      AgentJobExecutionCrud.singleton = new AgentJobExecutionCrud()
    }
    return AgentJobExecutionCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'agentjobexecution:manage', 
      view: 'agentjobexecution:view', 
      create: 'agentjobexecution:create', 
      update: 'agentjobexecution:update', 
      delete: 'agentjobexecution:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'jobId',key:'jobId', align: 'start'},
{title: 'status',key:'status', align: 'start'},
{title: 'trigger',key:'trigger', align: 'start'},
{title: 'scheduledFor',key:'scheduledFor', align: 'start'},
{title: 'startedAt',key:'startedAt', align: 'start'},
{title: 'attempt',key:'attempt', align: 'start'}
    ]
  }
  
  get selectedHeaders(): string[] {
    return this.headers.map(header => header.key)
  }
  
  get actionHeaders():IEntityCrudHeader[]{
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

  get provider(): IDraxCrudProvider<any, any, any>{
    return AgentJobExecutionProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      AgentJob: AgentJobCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      jobId: [(v: any) => !!v || 'validation.required'],
status: [(v: any) => !!v || 'validation.required'],
trigger: [(v: any) => !!v || 'validation.required'],
promptSnapshot: [],
result: [],
toolCalls: [],
error: [],
usage: []
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'jobId',type:'ref',label:'jobId',default:null,groupTab: 'GENERAL',ref: 'AgentJob',refDisplay: 'name'},
{name:'status',type:'enum',label:'status',default:null,groupTab: 'GENERAL',enum: ['pending', 'running', 'success', 'failed', 'timeout']},
{name:'trigger',type:'enum',label:'trigger',default:'scheduled',groupTab: 'GENERAL',enum: ['scheduled', 'manual', 'retry']},
{name:'scheduledFor',type:'date',label:'scheduledFor',default:null,groupTab: 'TIMING'},
{name:'startedAt',type:'date',label:'startedAt',default:null,groupTab: 'TIMING'},
{name:'finishedAt',type:'date',label:'finishedAt',default:null,groupTab: 'TIMING'},
{name:'durationMs',type:'number',label:'durationMs',default:null,groupTab: 'TIMING'},
{name:'attempt',type:'number',label:'attempt',default:1,groupTab: 'GENERAL'},
{name:'promptSnapshot',type:'object',label:'promptSnapshot',default:{"systemPrompt":"","allowedTools":[]},groupTab: 'PROMPT',objectFields: [{name:'systemPrompt',type:'longString',label:'systemPrompt',default:''},
{name:'allowedTools',type:'array.string',label:'allowedTools',default:[]}]},
{name:'result',type:'object',label:'result',default:{"summary":"","actions":[],"data":null,"outcome":""},groupTab: 'RESULT',objectFields: [{name:'summary',type:'longString',label:'summary',default:''},
{name:'actions',type:'array.object',label:'actions',default:[],objectFields: [{name:'type',type:'string',label:'type',default:''},
{name:'description',type:'longString',label:'description',default:''},
{name:'entityType',type:'string',label:'entityType',default:''},
{name:'entityId',type:'string',label:'entityId',default:''},
{name:'status',type:'enum',label:'status',default:'success',enum: ['success', 'failed']}]},
{name:'data',type:'record',label:'data',default:null},
{name:'outcome',type:'string',label:'outcome',default:''}]},
{name:'toolCalls',type:'array.object',label:'toolCalls',default:[],groupTab: 'TOOLS',objectFields: [{name:'name',type:'string',label:'name',default:''},
{name:'status',type:'enum',label:'status',default:null,enum: ['success', 'failed']},
{name:'input',type:'record',label:'input',default:null},
{name:'output',type:'record',label:'output',default:null},
{name:'errorMessage',type:'longString',label:'errorMessage',default:''},
{name:'durationMs',type:'number',label:'durationMs',default:null}]},
{name:'error',type:'object',label:'error',default:{"code":"","message":""},groupTab: 'ERROR',objectFields: [{name:'code',type:'string',label:'code',default:''},
{name:'message',type:'longString',label:'message',default:''}]},
{name:'usage',type:'object',label:'usage',default:{"model":"","inputTokens":null,"outputTokens":null,"totalTokens":null},groupTab: 'USAGE',objectFields: [{name:'model',type:'string',label:'model',default:''},
{name:'inputTokens',type:'number',label:'inputTokens',default:null},
{name:'outputTokens',type:'number',label:'outputTokens',default:null},
{name:'totalTokens',type:'number',label:'totalTokens',default:null}]}
    ]
  }
  
  get filters():IEntityCrudFilter[]{
    return [
      //{name: '_id', type: 'string', label: 'ID', default: '', operator: 'eq' },
    ]
  }
  
  get isViewable(){
    return true
  }

  get isEditable(){
    return true
  }

  get isCreatable(){
    return true
  }

  get isDeletable(){
    return true
  }

  get isExportable(){
    return true
  }

  get exportFormats(){
    return ['CSV', 'JSON']
  }

  get exportHeaders(){
    return ['_id']
  }

  get isImportable(){
    return false
  }
  
  get isColumnSelectable() {
    return true
  }

  get isGroupable() {
    return true
  }

  get importFormats(){
    return ['CSV', 'JSON']
  }

  get dialogFullscreen(){
    return false
  }
  
  get tabs() {
    return [
     'GENERAL', 'TIMING', 'PROMPT', 'RESULT', 'TOOLS', 'ERROR', 'USAGE'
    ]
  }
  
  get menus() {
    return [
     
    ]
  }
  
  get searchEnable() {
    return true
  }

   get filtersEnable(){
    return true
  }

  get dynamicFiltersEnable(){
    return true
  }

  get isAiAssistable(){
    return false
  }

  get navigationOperations(): IEntityCrudOperation[] {
    return ['view'] // edit, delete
  }
  
  get isSavedQueriesEnabled(){
    return true
  }

}

export default AgentJobExecutionCrud
