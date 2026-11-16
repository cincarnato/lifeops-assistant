import TaskServiceFactory from "../../modules/lifeops/factory/services/TaskServiceFactory.js";

async function MigrateTaskImportance(): Promise<void> {
    await TaskServiceFactory.instance.migrateImportance()
}

export default MigrateTaskImportance;
export {MigrateTaskImportance};
