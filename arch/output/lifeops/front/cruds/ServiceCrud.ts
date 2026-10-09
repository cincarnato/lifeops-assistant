
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
import ServiceProvider from "../providers/ServiceProvider";

//Import EntityCrud Refs
import BusinessPartnerCrud from "./BusinessPartnerCrud";

class ServiceCrud extends EntityCrud implements IEntityCrud {

  static singleton: ServiceCrud
  private store

  constructor() {
    super();
    this.name = 'Service'
    this.store = useCrudStore(this.name)
  }

  static get instance(): ServiceCrud {
    if(!ServiceCrud.singleton){
      ServiceCrud.singleton = new ServiceCrud()
    }
    return ServiceCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'service:manage',
      view: 'service:view',
      create: 'service:create',
      update: 'service:update',
      delete: 'service:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'name',key:'name', align: 'start'},
{title: 'businessPartner',key:'businessPartner', align: 'start'},
{title: 'type',key:'type', align: 'start'},
{title: 'amount',key:'amount', align: 'start'},
{title: 'frequency',key:'frequency', align: 'start'},
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
    return ServiceProvider.instance
  }

  get refs(): IEntityCrudRefs{
    return {
      BusinessPartner: BusinessPartnerCrud.instance
    }
  }

  get rules():IEntityCrudRules{
    return {
      name: [(v: any) => !!v || 'validation.required'],
businessPartner: [(v: any) => !!v || 'validation.required'],
type: [(v: any) => !!v || 'validation.required'],
amount: [(v: any) => !!v || 'validation.required'],
frequency: [(v: any) => !!v || 'validation.required'],
active: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'name',type:'string',label:'name',default:''},
{name:'businessPartner',type:'ref',label:'businessPartner',default:null,ref: 'BusinessPartner',refDisplay: 'name'},
{name:'type',type:'enum',label:'type',default:null,enum: ['INCOME', 'EXPENSE']},
{name:'amount',type:'number',label:'amount',default:null},
{name:'frequency',type:'enum',label:'frequency',default:null,enum: ['MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'YEARLY', 'ON_DEMAND']},
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

export default ServiceCrud
