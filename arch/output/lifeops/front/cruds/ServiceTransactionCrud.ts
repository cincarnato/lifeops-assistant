
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
import ServiceTransactionProvider from "../providers/ServiceTransactionProvider";

//Import EntityCrud Refs
import ServiceCrud from "./ServiceCrud";

class ServiceTransactionCrud extends EntityCrud implements IEntityCrud {

  static singleton: ServiceTransactionCrud
  private store

  constructor() {
    super();
    this.name = 'ServiceTransaction'
    this.store = useCrudStore(this.name)
  }

  static get instance(): ServiceTransactionCrud {
    if(!ServiceTransactionCrud.singleton){
      ServiceTransactionCrud.singleton = new ServiceTransactionCrud()
    }
    return ServiceTransactionCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'servicetransaction:manage',
      view: 'servicetransaction:view',
      create: 'servicetransaction:create',
      update: 'servicetransaction:update',
      delete: 'servicetransaction:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'service',key:'service', align: 'start'},
{title: 'period',key:'period', align: 'start'},
{title: 'amount',key:'amount', align: 'start'},
{title: 'status',key:'status', align: 'start'},
{title: 'paidAt',key:'paidAt', align: 'start'}
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
    return ServiceTransactionProvider.instance
  }

  get refs(): IEntityCrudRefs{
    return {
      Service: ServiceCrud.instance
    }
  }

  get rules():IEntityCrudRules{
    return {
      service: [(v: any) => !!v || 'validation.required'],
period: [(v: any) => !!v || 'validation.required'],
amount: [(v: any) => !!v || 'validation.required'],
status: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'service',type:'ref',label:'service',default:null,ref: 'Service',refDisplay: 'name'},
{name:'period',type:'string',label:'period',default:''},
{name:'amount',type:'number',label:'amount',default:null},
{name:'status',type:'enum',label:'status',default:'PENDING',enum: ['PENDING', 'PAID']},
{name:'paidAt',type:'date',label:'paidAt',default:null}
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

  get exportPretty(){
    return true
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

export default ServiceTransactionCrud
