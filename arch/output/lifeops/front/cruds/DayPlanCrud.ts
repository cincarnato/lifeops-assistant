
import {EntityCrud, useCrudStore} from "@drax/crud-vue";
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
import DayPlanProvider from "../providers/DayPlanProvider";

//Import EntityCrud Refs


class DayPlanCrud extends EntityCrud implements IEntityCrud {

  static singleton: DayPlanCrud
  private store

  constructor() {
    super();
    this.name = 'DayPlan'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): DayPlanCrud {
    if(!DayPlanCrud.singleton){
      DayPlanCrud.singleton = new DayPlanCrud()
    }
    return DayPlanCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'dayplan:manage', 
      view: 'dayplan:view', 
      create: 'dayplan:create', 
      update: 'dayplan:update', 
      delete: 'dayplan:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'date',key:'date', align: 'start'},
{title: 'status',key:'status', align: 'start'}
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
    return DayPlanProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      
    }
  }

  get rules():IEntityCrudRules{
    return {
      date: [(v: any) => !!v || 'validation.required'],
status: [(v: any) => !!v || 'validation.required'],
events: [],
tasks: [],
habits: [],
suggestions: []
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'date',type:'date',label:'date',default:null},
{name:'status',type:'enum',label:'status',default:'BORRADOR',enum: ['BORRADOR', 'VISTO', 'CONFIRMADO', 'CERRADO']},
{name:'events',type:'array.object',label:'events',default:[],objectFields: [{name:'googleEventId',type:'string',label:'googleEventId',default:''},
{name:'title',type:'string',label:'title',default:''},
{name:'description',type:'longString',label:'description',default:''},
{name:'startAt',type:'date',label:'startAt',default:null},
{name:'endAt',type:'date',label:'endAt',default:null},
{name:'decision',type:'enum',label:'decision',default:'PENDIENTE',enum: ['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']}]},
{name:'tasks',type:'array.object',label:'tasks',default:[],objectFields: [{name:'task',type:'ref',label:'task',default:null,ref: 'Task',refDisplay: 'title'},
{name:'decision',type:'enum',label:'decision',default:'PENDIENTE',enum: ['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']}]},
{name:'habits',type:'array.object',label:'habits',default:[],objectFields: [{name:'habit',type:'ref',label:'habit',default:null,ref: 'Habit',refDisplay: 'name'},
{name:'decision',type:'enum',label:'decision',default:'PENDIENTE',enum: ['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']}]},
{name:'suggestions',type:'array.object',label:'suggestions',default:[],objectFields: [{name:'title',type:'string',label:'title',default:''},
{name:'decision',type:'enum',label:'decision',default:'PENDIENTE',enum: ['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']},
{name:'goal',type:'ref',label:'goal',default:null,ref: 'Goal',refDisplay: 'name'},
{name:'project',type:'ref',label:'project',default:null,ref: 'Project',refDisplay: 'name'}]}
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

  get navigationOperations(){
    return ['view'] // edit, delete
  }
  
  get isSavedQueriesEnabled(){
    return true
  }

}

export default DayPlanCrud

