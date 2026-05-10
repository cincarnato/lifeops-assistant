
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
import ClientProvider from "../providers/ClientProvider";

//Import EntityCrud Refs
import CompanyCrud from "./CompanyCrud";
import ContactCrud from "./ContactCrud";
import {UserCrud} from "@drax/identity-vue"

class ClientCrud extends EntityCrud implements IEntityCrud {

  static singleton: ClientCrud
  private store

  constructor() {
    super();
    this.name = 'Client'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): ClientCrud {
    if(!ClientCrud.singleton){
      ClientCrud.singleton = new ClientCrud()
    }
    return ClientCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'client:manage', 
      view: 'client:view', 
      create: 'client:create', 
      update: 'client:update', 
      delete: 'client:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'name',key:'name', align: 'start'},
{title: 'type',key:'type', align: 'start'},
{title: 'status',key:'status', align: 'start'},
{title: 'priority',key:'priority', align: 'start'},
{title: 'priorityScore',key:'priorityScore', align: 'start'},
{title: 'company',key:'company', align: 'start'},
{title: 'mainContact',key:'mainContact', align: 'start'},
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
    return ClientProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      Company: CompanyCrud.instance ,
Contact: ContactCrud.instance ,
User: UserCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      name: [(v: any) => !!v || 'validation.required'],
company: [(v: any) => !!v || 'validation.required'],
user: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'name',type:'string',label:'name',default:''},
{name:'description',type:'longString',label:'description',default:''},
{name:'type',type:'enum',label:'type',default:'company',enum: ['company', 'person', 'internal', 'partner']},
{name:'status',type:'enum',label:'status',default:'active',enum: ['active', 'inactive', 'prospect', 'paused', 'archived']},
{name:'priority',type:'string',label:'priority',default:''},
{name:'valueScore',type:'number',label:'valueScore',default:5},
{name:'relationshipScore',type:'number',label:'relationshipScore',default:null},
{name:'priorityScore',type:'number',label:'priorityScore',default:null},
{name:'website',type:'string',label:'website',default:''},
{name:'emailDomains',type:'array.string',label:'emailDomains',default:[]},
{name:'company',type:'ref',label:'company',default:null,ref: 'Company',refDisplay: 'name'},
{name:'mainContact',type:'ref',label:'mainContact',default:null,ref: 'Contact',refDisplay: 'displayName'},
{name:'redmineProjectIds',type:'array.string',label:'redmineProjectIds',default:[]},
{name:'tags',type:'array.string',label:'tags',default:[]},
{name:'notes',type:'longString',label:'notes',default:''},
{name:'user',type:'ref',label:'user',default:null,ref: 'User',refDisplay: 'username'},
{name:'archivedAt',type:'date',label:'archivedAt',default:null}
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

export default ClientCrud

