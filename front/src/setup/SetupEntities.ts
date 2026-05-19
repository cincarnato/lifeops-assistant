import {UserCrud, RoleCrud, TenantCrud} from "@drax/identity-vue"
import { useEntityStore } from '@drax/crud-vue'
import { FileEntityCrud } from '@drax/media-vue'
import AgentJobCrud from "@/modules/lifeops/cruds/AgentJobCrud";
import AgentJobExecutionCrud from "@/modules/lifeops/cruds/AgentJobExecutionCrud";
import ClientCrud from "@/modules/lifeops/cruds/ClientCrud";
import ClientTypeCrud from "@/modules/lifeops/cruds/ClientTypeCrud";
import CompanyCrud from "@/modules/lifeops/cruds/CompanyCrud";
import CompanyTypeCrud from "@/modules/lifeops/cruds/CompanyTypeCrud";
import ContactCrud from "@/modules/lifeops/cruds/ContactCrud";
import ContactTypeCrud from "@/modules/lifeops/cruds/ContactTypeCrud";
import GoalCrud from "@/modules/lifeops/cruds/GoalCrud";
import HabitCrud from "@/modules/lifeops/cruds/HabitCrud";
import HabitLogCrud from "@/modules/lifeops/cruds/HabitLogCrud";
import LifeAreaCrud from "@/modules/lifeops/cruds/LifeAreaCrud";
import MemoryCrud from "@/modules/lifeops/cruds/MemoryCrud";
import MemoryTypeCrud from "@/modules/lifeops/cruds/MemoryTypeCrud";
import PriorityCrud from "@/modules/lifeops/cruds/PriorityCrud";
import ProjectCrud from "@/modules/lifeops/cruds/ProjectCrud";
import PurposeCrud from "@/modules/lifeops/cruds/PurposeCrud";
import SourceCrud from "@/modules/lifeops/cruds/SourceCrud";
import TaskCrud from "@/modules/lifeops/cruds/TaskCrud";
import TaskStatusCrud from "@/modules/lifeops/cruds/TaskStatusCrud";
import TaskTypeCrud from "@/modules/lifeops/cruds/TaskTypeCrud";

function setupEntities(){
  const entityStore = useEntityStore()
  entityStore.addEntity(UserCrud.instance)
  entityStore.addEntity(RoleCrud.instance)
  entityStore.addEntity(TenantCrud.instance)
  entityStore.addEntity(FileEntityCrud.instance)
  entityStore.addEntity(AgentJobCrud.instance)
  entityStore.addEntity(AgentJobExecutionCrud.instance)
  entityStore.addEntity(ClientCrud.instance)
  entityStore.addEntity(ClientTypeCrud.instance)
  entityStore.addEntity(CompanyCrud.instance)
  entityStore.addEntity(CompanyTypeCrud.instance)
  entityStore.addEntity(ContactCrud.instance)
  entityStore.addEntity(ContactTypeCrud.instance)
  entityStore.addEntity(GoalCrud.instance)
  entityStore.addEntity(HabitCrud.instance)
  entityStore.addEntity(HabitLogCrud.instance)
  entityStore.addEntity(LifeAreaCrud.instance)
  entityStore.addEntity(MemoryCrud.instance)
  entityStore.addEntity(MemoryTypeCrud.instance)
  entityStore.addEntity(PriorityCrud.instance)
  entityStore.addEntity(ProjectCrud.instance)
  entityStore.addEntity(PurposeCrud.instance)
  entityStore.addEntity(SourceCrud.instance)
  entityStore.addEntity(TaskCrud.instance)
  entityStore.addEntity(TaskStatusCrud.instance)
  entityStore.addEntity(TaskTypeCrud.instance)

}

export default setupEntities
