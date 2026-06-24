
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
import MemoryProvider from "../providers/MemoryProvider";

//Import EntityCrud Refs


class MemoryCrud extends EntityCrud implements IEntityCrud {

  static singleton: MemoryCrud
  private store

  constructor() {
    super();
    this.name = 'Memory'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): MemoryCrud {
    if(!MemoryCrud.singleton){
      MemoryCrud.singleton = new MemoryCrud()
    }
    return MemoryCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'memory:manage', 
      view: 'memory:view', 
      create: 'memory:create', 
      update: 'memory:update', 
      delete: 'memory:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'title',key:'title', align: 'start'},
{title: 'type',key:'type', align: 'start'},
{title: 'priority',key:'priority', align: 'start'},
{title: 'source',key:'source', align: 'start'}
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
    return MemoryProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      
    }
  }

  get rules():IEntityCrudRules{
    return {
      title: [(v: any) => !!v || 'validation.required'],
content: [(v: any) => !!v || 'validation.required'],
type: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'title',type:'string',label:'title',default:''},
{name:'content',type:'longString',label:'content',default:''},
{name:'type',type:'string',label:'type',default:''},
{name:'tags',type:'array.string',label:'tags',default:[]},
{name:'priority',type:'string',label:'priority',default:''},
{name:'source',type:'string',label:'source',default:'manual'}
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

export default MemoryCrud

