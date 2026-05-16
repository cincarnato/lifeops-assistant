
import {EntityCrud, useCrudStore} from "@drax/crud-vue";
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
import HabitLogProvider from "../providers/HabitLogProvider";

//Import EntityCrud Refs
import HabitCrud from "./HabitCrud";
import TaskCrud from "./TaskCrud";

class HabitLogCrud extends EntityCrud implements IEntityCrud {

  static singleton: HabitLogCrud
  private store

  constructor() {
    super();
    this.name = 'HabitLog'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): HabitLogCrud {
    if(!HabitLogCrud.singleton){
      HabitLogCrud.singleton = new HabitLogCrud()
    }
    return HabitLogCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'habitlog:manage', 
      view: 'habitlog:view', 
      create: 'habitlog:create', 
      update: 'habitlog:update', 
      delete: 'habitlog:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'habit',key:'habit', align: 'start'},
{title: 'date',key:'date', align: 'start'},
{title: 'task',key:'task', align: 'start'}
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
    return HabitLogProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      Habit: HabitCrud.instance ,
Task: TaskCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      habit: [(v: any) => !!v || 'validation.required'],
date: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'habit',type:'ref',label:'habit',default:null,ref: 'Habit',refDisplay: 'name'},
{name:'date',type:'date',label:'date',default:null},
{name:'task',type:'ref',label:'task',default:null,ref: 'Task',refDisplay: 'title'}
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

  get navigationOperations(): IEntityCrudOperation[] {
    return ['view'] // edit, delete
  }
  
  get isSavedQueriesEnabled(){
    return true
  }

}

export default HabitLogCrud
