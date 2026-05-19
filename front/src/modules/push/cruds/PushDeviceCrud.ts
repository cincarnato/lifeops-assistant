
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
import PushDeviceProvider from "../providers/PushDeviceProvider";

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"

class PushDeviceCrud extends EntityCrud implements IEntityCrud {

  static singleton: PushDeviceCrud
  private store

  constructor() {
    super();
    this.name = 'PushDevice'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): PushDeviceCrud {
    if(!PushDeviceCrud.singleton){
      PushDeviceCrud.singleton = new PushDeviceCrud()
    }
    return PushDeviceCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'pushdevice:manage', 
      view: 'pushdevice:view', 
      create: 'pushdevice:create', 
      update: 'pushdevice:update', 
      delete: 'pushdevice:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'user',key:'user', align: 'start'},
{title: 'platform',key:'platform', align: 'start'},
{title: 'token',key:'token', align: 'start'},
{title: 'deviceName',key:'deviceName', align: 'start'},
{title: 'enabled',key:'enabled', align: 'start'},
{title: 'lastSeenAt',key:'lastSeenAt', align: 'start'}
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
    return PushDeviceProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      User: UserCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      user: [(v: any) => !!v || 'validation.required'],
platform: [(v: any) => !!v || 'validation.required'],
token: [(v: any) => !!v || 'validation.required'],
enabled: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'user',type:'ref',label:'user',default:null,ref: 'User',refDisplay: 'username'},
{name:'platform',type:'enum',label:'platform',default:null,enum: ['android', 'ios', 'web']},
{name:'token',type:'string',label:'token',default:''},
{name:'deviceName',type:'string',label:'deviceName',default:''},
{name:'enabled',type:'boolean',label:'enabled',default:true},
{name:'lastSeenAt',type:'date',label:'lastSeenAt',default:null}
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

export default PushDeviceCrud
