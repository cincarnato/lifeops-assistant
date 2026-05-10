
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
import GoalProvider from "../providers/GoalProvider";

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"

class GoalCrud extends EntityCrud implements IEntityCrud {

  static singleton: GoalCrud
  private store

  constructor() {
    super();
    this.name = 'Goal'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): GoalCrud {
    if(!GoalCrud.singleton){
      GoalCrud.singleton = new GoalCrud()
    }
    return GoalCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'goal:manage', 
      view: 'goal:view', 
      create: 'goal:create', 
      update: 'goal:update', 
      delete: 'goal:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'name',key:'name', align: 'start'},
{title: 'status',key:'status', align: 'start'},
{title: 'priority',key:'priority', align: 'start'},
{title: 'priorityScore',key:'priorityScore', align: 'start'},
{title: 'timeHorizon',key:'timeHorizon', align: 'start'},
{title: 'targetDate',key:'targetDate', align: 'start'},
{title: 'progressPercent',key:'progressPercent', align: 'start'},
{title: 'user',key:'user', align: 'start'}
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
    return GoalProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      User: UserCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      name: [(v: any) => !!v || 'validation.required'],
user: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'name',type:'string',label:'name',default:''},
{name:'description',type:'longString',label:'description',default:''},
{name:'status',type:'enum',label:'status',default:'draft',enum: ['draft', 'active', 'paused', 'completed', 'cancelled', 'archived']},
{name:'priority',type:'enum',label:'priority',default:'medium',enum: ['low', 'medium', 'high', 'critical']},
{name:'valueScore',type:'number',label:'valueScore',default:5},
{name:'motivationScore',type:'number',label:'motivationScore',default:5},
{name:'effortScore',type:'number',label:'effortScore',default:5},
{name:'priorityScore',type:'number',label:'priorityScore',default:null},
{name:'timeHorizon',type:'enum',label:'timeHorizon',default:'medium_term',enum: ['short_term', 'medium_term', 'long_term']},
{name:'targetDate',type:'date',label:'targetDate',default:null},
{name:'completedAt',type:'date',label:'completedAt',default:null},
{name:'archivedAt',type:'date',label:'archivedAt',default:null},
{name:'progressPercent',type:'number',label:'progressPercent',default:0},
{name:'successCriteria',type:'longString',label:'successCriteria',default:''},
{name:'purpose',type:'longString',label:'purpose',default:''},
{name:'constraints',type:'array.string',label:'constraints',default:[]},
{name:'tags',type:'array.string',label:'tags',default:[]},
{name:'user',type:'ref',label:'user',default:null,ref: 'User',refDisplay: 'username'}
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

export default GoalCrud

