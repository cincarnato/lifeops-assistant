
import ShoppingItemMongoRepository from '../../repository/mongo/ShoppingItemMongoRepository.js'
import ShoppingItemSqliteRepository from '../../repository/sqlite/ShoppingItemSqliteRepository.js'
import type {IShoppingItemRepository} from "../../interfaces/IShoppingItemRepository";
import {ShoppingItemService} from '../../services/ShoppingItemService.js'
import {ShoppingItemBaseSchema, ShoppingItemSchema} from "../../schemas/ShoppingItemSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class ShoppingItemServiceFactory {
    private static service: ShoppingItemService;

    public static get instance(): ShoppingItemService {
        if (!ShoppingItemServiceFactory.service) {

            let repository: IShoppingItemRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new ShoppingItemMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new ShoppingItemSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }

            const baseSchema = ShoppingItemBaseSchema;
            const fullSchema = ShoppingItemSchema;
            ShoppingItemServiceFactory.service = new ShoppingItemService(repository, baseSchema, fullSchema);
        }
        return ShoppingItemServiceFactory.service;
    }
}

export default ShoppingItemServiceFactory
export {
    ShoppingItemServiceFactory
}
