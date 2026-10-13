
import type{IShoppingItemRepository} from "../interfaces/IShoppingItemRepository";
import type {IShoppingItemBase, IShoppingItem} from "../interfaces/IShoppingItem";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import {NotFoundError} from '@drax/common-back';
import {ShoppingItemBaseSchema, ShoppingItemSchema} from '../schemas/ShoppingItemSchema.js';

class ShoppingItemService extends AbstractService<IShoppingItem, IShoppingItemBase, IShoppingItemBase> {


    constructor(ShoppingItemRepository: IShoppingItemRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(ShoppingItemRepository, baseSchema ?? ShoppingItemBaseSchema, fullSchema ?? ShoppingItemSchema);

        this._validateOutput = true
        this.transformCreate = async data => ({
            ...data,
            quantity: data.quantity || null,
            purchased: data.purchased ?? false,
            purchasedAt: data.purchased ? new Date() : null,
        });

    }

    override async validateInputUpdatePartial(data: IShoppingItemBase): Promise<IShoppingItemBase> {
        return this.validateInputUpdate(data);
    }

    override async update(id: string, data: IShoppingItemBase): Promise<IShoppingItem> {
        const parsed = await this.validateInputUpdate(data);
        return super.update(id, await this.withPurchaseDate(id, parsed));
    }

    override async updatePartial(id: string, data: Partial<IShoppingItemBase>): Promise<IShoppingItem> {
        const parsed = await this.validateInputUpdatePartial(data as IShoppingItemBase);
        return super.updatePartial(id, await this.withPurchaseDate(id, parsed));
    }

    private async withPurchaseDate(id: string, data: IShoppingItemBase): Promise<IShoppingItemBase> {
        const current = await this.findById(id);
        if (!current) throw new NotFoundError('Shopping item not found');
        return {
            ...data,
            purchasedAt: data.purchased === false ? null
                : data.purchased === true ? current.purchasedAt ?? new Date()
                : current.purchasedAt,
        };
    }
}

export default ShoppingItemService
export {ShoppingItemService}
