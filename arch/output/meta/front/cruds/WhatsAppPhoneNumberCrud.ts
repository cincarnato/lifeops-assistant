
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
import WhatsAppPhoneNumberProvider from "../providers/WhatsAppPhoneNumberProvider";

//Import EntityCrud Refs
import {TenantCrud} from "@drax/identity-vue"

class WhatsAppPhoneNumberCrud extends EntityCrud implements IEntityCrud {

  static singleton: WhatsAppPhoneNumberCrud
  private store

  constructor() {
    super();
    this.name = 'WhatsAppPhoneNumber'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): WhatsAppPhoneNumberCrud {
    if(!WhatsAppPhoneNumberCrud.singleton){
      WhatsAppPhoneNumberCrud.singleton = new WhatsAppPhoneNumberCrud()
    }
    return WhatsAppPhoneNumberCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'whatsappphonenumber:manage', 
      view: 'whatsappphonenumber:view', 
      create: 'whatsappphonenumber:create', 
      update: 'whatsappphonenumber:update', 
      delete: 'whatsappphonenumber:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'tenantId',key:'tenantId', align: 'start'},
{title: 'phoneNumberId',key:'phoneNumberId', align: 'start'},
{title: 'wabaId',key:'wabaId', align: 'start'},
{title: 'displayPhoneNumber',key:'displayPhoneNumber', align: 'start'},
{title: 'enabled',key:'enabled', align: 'start'}
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
    return WhatsAppPhoneNumberProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      Tenant: TenantCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      tenantId: [(v: any) => !!v || 'validation.required'],
phoneNumberId: [(v: any) => !!v || 'validation.required'],
wabaId: [(v: any) => !!v || 'validation.required'],
displayPhoneNumber: [(v: any) => !!v || 'validation.required'],
enabled: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'tenantId',type:'ref',label:'tenantId',default:null,ref: 'Tenant',refDisplay: 'name'},
{name:'phoneNumberId',type:'string',label:'phoneNumberId',default:''},
{name:'wabaId',type:'string',label:'wabaId',default:''},
{name:'displayPhoneNumber',type:'string',label:'displayPhoneNumber',default:''},
{name:'enabled',type:'boolean',label:'enabled',default:true}
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

export default WhatsAppPhoneNumberCrud

