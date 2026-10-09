
import {EntityCrud} from "@drax/crud-vue";
import type{
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader,
  IEntityCrudPermissions,
  IEntityCrudOperation,
  IEntityCrudRefs,
  IEntityCrudRules
} from "@drax/crud-share";
import ServiceProvider from "../providers/ServiceProvider";
import type {IService, IServiceBase} from '../interfaces/IService';

//Import EntityCrud Refs
import BusinessPartnerCrud from "./BusinessPartnerCrud";

class ServiceCrud extends EntityCrud implements IEntityCrud {

  static singleton: ServiceCrud


  constructor() {
    super();
    this.name = 'Service'

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

  get provider(): IDraxCrudProvider<IService, IServiceBase, IServiceBase>{
    return ServiceProvider.instance
  }

  get refs(): IEntityCrudRefs{
    return {
      BusinessPartner: BusinessPartnerCrud.instance
    }
  }

  get rules():IEntityCrudRules{
    return {
      name: [(v: string) => !!v?.trim() || 'validation.required'],
businessPartner: [(v: unknown) => !!v || 'validation.required'],
type: [(v: string) => ['INCOME', 'EXPENSE'].includes(v) || 'validation.required'],
amount: [(v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0) || 'service.validation.amount'],
frequency: [(v: string) => ['MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'YEARLY', 'ON_DEMAND'].includes(v) || 'validation.required']
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

  get navigationOperations(): IEntityCrudOperation[] {
    return ['view'] // edit, delete
  }

  get isSavedQueriesEnabled(){
    return true
  }

}

export default ServiceCrud
