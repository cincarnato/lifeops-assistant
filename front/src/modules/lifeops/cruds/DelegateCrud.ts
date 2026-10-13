import {EntityCrud} from "@drax/crud-vue";
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
import DelegateProvider from "../providers/DelegateProvider";

import ContactCrud from "./ContactCrud";

class DelegateCrud extends EntityCrud implements IEntityCrud {

  static singleton: DelegateCrud

  constructor() {
    super();
    this.name = 'Delegate'
  }

  static get instance(): DelegateCrud {
    if(!DelegateCrud.singleton){
      DelegateCrud.singleton = new DelegateCrud()
    }
    return DelegateCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'delegate:manage',
      view: 'delegate:view',
      create: 'delegate:create',
      update: 'delegate:update',
      delete: 'delegate:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'contact',key:'contact', align: 'start'},
{title: 'skills',key:'skills', align: 'start'},
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
    return DelegateProvider.instance
  }

  get refs(): IEntityCrudRefs{
    return {
      Contact: ContactCrud.instance
    }
  }

  get rules():IEntityCrudRules{
    return {
      contact: [(value: any) => !!value || 'validation.required'],
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'contact',type:'ref',label:'contact',default:null,ref: 'Contact',refDisplay: 'displayName'},
{name:'skills',type:'array.string',label:'skills',default:[]},
{name:'description',type:'longString',label:'description',default:''},
{name:'active',type:'boolean',label:'active',default:true},
    ]
  }

  get filters():IEntityCrudFilter[]{
    return [
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

  get isSavedQueriesEnabled(){
    return true
  }

  get formActionsFixed(): boolean {
    return true
  }

}

export default DelegateCrud
