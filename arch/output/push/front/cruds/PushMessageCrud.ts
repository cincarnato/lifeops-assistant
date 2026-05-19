
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
import PushMessageProvider from "../providers/PushMessageProvider";

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"

class PushMessageCrud extends EntityCrud implements IEntityCrud {

  static singleton: PushMessageCrud
  private store

  constructor() {
    super();
    this.name = 'PushMessage'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): PushMessageCrud {
    if(!PushMessageCrud.singleton){
      PushMessageCrud.singleton = new PushMessageCrud()
    }
    return PushMessageCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'pushmessage:manage', 
      view: 'pushmessage:view', 
      create: 'pushmessage:create', 
      update: 'pushmessage:update', 
      delete: 'pushmessage:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'user',key:'user', align: 'start'},
{title: 'title',key:'title', align: 'start'},
{title: 'body',key:'body', align: 'start'},
{title: 'status',key:'status', align: 'start'},
{title: 'providerMessageId',key:'providerMessageId', align: 'start'},
{title: 'type',key:'type', align: 'start'},
{title: 'sentAt',key:'sentAt', align: 'start'}
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
    return PushMessageProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      User: UserCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      user: [(v: any) => !!v || 'validation.required'],
title: [(v: any) => !!v || 'validation.required'],
body: [(v: any) => !!v || 'validation.required'],
status: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'user',type:'ref',label:'user',default:null,ref: 'User',refDisplay: 'username'},
{name:'title',type:'string',label:'title',default:''},
{name:'body',type:'longString',label:'body',default:''},
{name:'status',type:'enum',label:'status',default:'pending',enum: ['pending', 'sent', 'failed', 'read']},
{name:'providerMessageId',type:'string',label:'providerMessageId',default:''},
{name:'type',type:'string',label:'type',default:''},
{name:'errorMessage',type:'longString',label:'errorMessage',default:''},
{name:'sentAt',type:'date',label:'sentAt',default:null}
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

export default PushMessageCrud
