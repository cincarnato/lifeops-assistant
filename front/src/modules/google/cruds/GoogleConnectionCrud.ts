
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
import GoogleConnectionProvider from "../providers/GoogleConnectionProvider";

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"

class GoogleConnectionCrud extends EntityCrud implements IEntityCrud {

  static singleton: GoogleConnectionCrud

  constructor() {
    super();
    this.name = 'GoogleConnection'
  }
  
  static get instance(): GoogleConnectionCrud {
    if(!GoogleConnectionCrud.singleton){
      GoogleConnectionCrud.singleton = new GoogleConnectionCrud()
    }
    return GoogleConnectionCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'googleconnection:manage', 
      view: 'googleconnection:view', 
      create: 'googleconnection:create', 
      update: 'googleconnection:update', 
      delete: 'googleconnection:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'userId',key:'userId', align: 'start'},
{title: 'provider',key:'provider', align: 'start'},
{title: 'googleEmail',key:'googleEmail', align: 'start'},
{title: 'googleUserId',key:'googleUserId', align: 'start'},
{title: 'expiryDate',key:'expiryDate', align: 'start'},
{title: 'status',key:'status', align: 'start'},
{title: 'lastUsedAt',key:'lastUsedAt', align: 'start'},
{title: 'connectedAt',key:'connectedAt', align: 'start'}
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
    return GoogleConnectionProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      User: UserCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      userId: [(v: any) => !!v || 'validation.required'],
provider: [(v: any) => !!v || 'validation.required'],
googleEmail: [(v: any) => !!v || 'validation.required'],
googleUserId: [(v: any) => !!v || 'validation.required'],
refreshToken: [(v: any) => !!v || 'validation.required'],
scope: [(v: any) => !!v || 'validation.required'],
expiryDate: [(v: any) => !!v || 'validation.required'],
status: [(v: any) => !!v || 'validation.required'],
connectedAt: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'userId',type:'ref',label:'userId',default:null,ref: 'User',refDisplay: 'email'},
{name:'provider',type:'enum',label:'provider',default:'google',enum: ['google']},
{name:'googleEmail',type:'string',label:'googleEmail',default:''},
{name:'googleUserId',type:'string',label:'googleUserId',default:''},
{name:'accessToken',type:'longString',label:'accessToken',default:''},
{name:'refreshToken',type:'longString',label:'refreshToken',default:''},
{name:'scope',type:'array.string',label:'scope',default:[]},
{name:'expiryDate',type:'date',label:'expiryDate',default:null},
{name:'status',type:'enum',label:'status',default:'active',enum: ['active', 'revoked', 'error']},
{name:'lastUsedAt',type:'date',label:'lastUsedAt',default:null},
{name:'connectedAt',type:'date',label:'connectedAt',default:null}
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

  get navigationOperations(): IEntityCrudOperation[]{
    return ['view'] // edit, delete
  }
  
  get isSavedQueriesEnabled(){
    return true
  }

}

export default GoogleConnectionCrud
