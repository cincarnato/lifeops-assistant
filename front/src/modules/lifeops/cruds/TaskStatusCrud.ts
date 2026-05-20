
import {EntityCrud} from "@drax/crud-vue";
import type{
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader, 
  IEntityCrudPermissions,
  IEntityCrudRefs,
  IEntityCrudRules
} from "@drax/crud-share";
import TaskStatusProvider from "../providers/TaskStatusProvider";

//Import EntityCrud Refs


class TaskStatusCrud extends EntityCrud implements IEntityCrud {

  static singleton: TaskStatusCrud

  constructor() {
    super();
    this.name = 'TaskStatus'
  }
  
  static get instance(): TaskStatusCrud {
    if(!TaskStatusCrud.singleton){
      TaskStatusCrud.singleton = new TaskStatusCrud()
    }
    return TaskStatusCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'taskstatus:manage', 
      view: 'taskstatus:view', 
      create: 'taskstatus:create', 
      update: 'taskstatus:update', 
      delete: 'taskstatus:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'name',key:'name', align: 'start'},
        {title: 'color',key:'color', align: 'start'},
        {title: 'completesTask',key:'completesTask', align: 'start'},
        {title: 'archivesTask',key:'archivesTask', align: 'start'}
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
    return TaskStatusProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      
    }
  }

  get rules():IEntityCrudRules{
    return {
      name: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'name',type:'string',label:'name',default:''},
{name:'description',type:'longString',label:'description',default:''},
{name:'color',type:'string',label:'color',default:'#64748b'},
{name:'completesTask',type:'boolean',label:'completesTask',default:false},
{name:'archivesTask',type:'boolean',label:'archivesTask',default:false}
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

  get isSavedQueriesEnabled(){
    return true
  }

}

export default TaskStatusCrud
