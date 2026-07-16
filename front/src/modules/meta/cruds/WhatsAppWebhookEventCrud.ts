
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
import WhatsAppWebhookEventProvider from "../providers/WhatsAppWebhookEventProvider";

//Import EntityCrud Refs
import {TenantCrud} from "@drax/identity-vue"
import WhatsAppPhoneNumberCrud from "./WhatsAppPhoneNumberCrud";

class WhatsAppWebhookEventCrud extends EntityCrud implements IEntityCrud {

  static singleton: WhatsAppWebhookEventCrud
  private store

  constructor() {
    super();
    this.name = 'WhatsAppWebhookEvent'
    this.store = useCrudStore(this.name)
  }

  static get instance(): WhatsAppWebhookEventCrud {
    if(!WhatsAppWebhookEventCrud.singleton){
      WhatsAppWebhookEventCrud.singleton = new WhatsAppWebhookEventCrud()
    }
    return WhatsAppWebhookEventCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'whatsappwebhookevent:manage',
      view: 'whatsappwebhookevent:view',
      create: 'whatsappwebhookevent:create',
      update: 'whatsappwebhookevent:update',
      delete: 'whatsappwebhookevent:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'tenantId',key:'tenantId', align: 'start'},
{title: 'phoneNumberRef',key:'phoneNumberRef', align: 'start'},
{title: 'object',key:'object', align: 'start'},
{title: 'field',key:'field', align: 'start'},
{title: 'wabaId',key:'wabaId', align: 'start'},
{title: 'phoneNumberId',key:'phoneNumberId', align: 'start'},
{title: 'receivedAt',key:'receivedAt', align: 'start'},
{title: 'eventAt',key:'eventAt', align: 'start'},
{title: 'processingStatus',key:'processingStatus', align: 'start'},
{title: 'processingAttempts',key:'processingAttempts', align: 'start'},
{title: 'deduplicationKey',key:'deduplicationKey', align: 'start'}
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
    return WhatsAppWebhookEventProvider.instance
  }

  get refs(): IEntityCrudRefs{
    return {
      Tenant: TenantCrud.instance ,
WhatsAppPhoneNumber: WhatsAppPhoneNumberCrud.instance
    }
  }

  get rules():IEntityCrudRules{
    return {
      object: [(v: any) => !!v || 'validation.required'],
field: [(v: any) => !!v || 'validation.required'],
receivedAt: [(v: any) => !!v || 'validation.required'],
processingStatus: [(v: any) => !!v || 'validation.required'],
processingAttempts: [(v: any) => !!v || 'validation.required'],
lastError: [],
payload: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'tenantId',type:'ref',label:'tenantId',default:null,ref: 'Tenant',refDisplay: 'name',md:6},
{name:'phoneNumberRef',type:'ref',label:'phoneNumberRef',default:null,ref: 'WhatsAppPhoneNumber',refDisplay: 'displayPhoneNumber',md:6},
{name:'object',type:'string',label:'object',default:'',md:4},
{name:'field',type:'string',label:'field',default:'',md:4},
{name:'wabaId',type:'string',label:'wabaId',default:'',md:4},
{name:'phoneNumberId',type:'string',label:'phoneNumberId',default:'',md:4},
{name:'receivedAt',type:'date',label:'receivedAt',default:null,md:4},
{name:'eventAt',type:'date',label:'eventAt',default:null,md:4},
{name:'processingStatus',type:'enum',label:'processingStatus',default:'PENDING',enum: ['PENDING', 'PROCESSING', 'PROCESSED', 'IGNORED', 'ERROR'],md:4},
{name:'processingAttempts',type:'number',label:'processingAttempts',default:0,md:4},
{name:'processedAt',type:'date',label:'processedAt',default:null,md:4},
{name:'lastProcessingAttemptAt',type:'date',label:'lastProcessingAttemptAt',default:null,md:4},
{name:'lastError',type:'object',label:'lastError',default:{"message":"''","stack":"''","code":"''"},md:12,objectFields: [{name:'message',type:'string',label:'message',default:''},
{name:'stack',type:'longString',label:'stack',default:''},
{name:'code',type:'string',label:'code',default:''}]},
{name:'payload',type:'object',label:'payload',default:{},objectFields: [],md:12},
{name:'deduplicationKey',type:'string',label:'deduplicationKey',default:'',md:12}
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
    return false
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
    return true
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

  get containerFluid(){
    return true
  }

}

export default WhatsAppWebhookEventCrud
