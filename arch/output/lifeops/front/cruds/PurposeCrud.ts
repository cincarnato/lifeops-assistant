
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
import PurposeProvider from "../providers/PurposeProvider";

//Import EntityCrud Refs


class PurposeCrud extends EntityCrud implements IEntityCrud {

  static singleton: PurposeCrud
  private store

  constructor() {
    super();
    this.name = 'Purpose'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): PurposeCrud {
    if(!PurposeCrud.singleton){
      PurposeCrud.singleton = new PurposeCrud()
    }
    return PurposeCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'purpose:manage', 
      view: 'purpose:view', 
      create: 'purpose:create', 
      update: 'purpose:update', 
      delete: 'purpose:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'title',key:'title', align: 'start'},
{title: 'isPrimary',key:'isPrimary', align: 'start'},
{title: 'active',key:'active', align: 'start'}
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
    return PurposeProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      
    }
  }

  get rules():IEntityCrudRules{
    return {
      title: [(v: any) => !!v || 'validation.required'],
statement: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'title',type:'string',label:'title',default:''},
{name:'statement',type:'longString',label:'statement',default:''},
{name:'isPrimary',type:'boolean',label:'isPrimary',default:false},
{name:'active',type:'boolean',label:'active',default:true}
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

export default PurposeCrud
