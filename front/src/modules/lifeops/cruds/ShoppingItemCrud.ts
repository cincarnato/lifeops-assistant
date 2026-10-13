
import {EntityCrud, useCrudStore} from "@drax/crud-vue";
import type{
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudOperation,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader,
  IEntityCrudPermissions,
  IEntityCrudRefs,
  IEntityCrudRules
} from "@drax/crud-share";
import ShoppingItemProvider from "../providers/ShoppingItemProvider";
import type {IShoppingItem, IShoppingItemBase} from '../interfaces/IShoppingItem';

class ShoppingItemCrud extends EntityCrud implements IEntityCrud {

  static singleton: ShoppingItemCrud
  private store

  constructor() {
    super();
    this.name = 'ShoppingItem'
    this.store = useCrudStore(this.name)
  }

  static get instance(): ShoppingItemCrud {
    if(!ShoppingItemCrud.singleton){
      ShoppingItemCrud.singleton = new ShoppingItemCrud()
    }
    return ShoppingItemCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'shoppingitem:manage',
      view: 'shoppingitem:view',
      create: 'shoppingitem:create',
      update: 'shoppingitem:update',
      delete: 'shoppingitem:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'name',key:'name', align: 'start'},
{title: 'quantity',key:'quantity', align: 'start'},
{title: 'purchased',key:'purchased', align: 'start'},
{title: 'purchasedAt',key:'purchasedAt', align: 'start'},
{title: 'createdAt',key:'createdAt', align: 'start'}
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

  get provider(): IDraxCrudProvider<IShoppingItem, IShoppingItemBase, IShoppingItemBase>{
    return ShoppingItemProvider.instance
  }

  get refs(): IEntityCrudRefs{
    return {}
  }

  get rules():IEntityCrudRules{
    return {
      name: [(value: unknown) => (typeof value === 'string' && !!value.trim()) || 'validation.required'],
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'name',type:'string',label:'name',default:''},
{name:'quantity',type:'string',label:'quantity',default:null},
{name:'purchased',type:'boolean',label:'purchased',default:false}
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

  get navigationOperations(): IEntityCrudOperation[]{
    return ['view']
  }

  get isSavedQueriesEnabled(){
    return true
  }

  get formActionsFixed(): boolean {
    return true
  }

}

export default ShoppingItemCrud
