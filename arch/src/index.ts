import { ArchGenerator } from '@drax/arch';
import GoalSchema from './schemas/lifeops/GoalSchema.js';
import ProjectSchema from './schemas/lifeops/ProjectSchema.js';
import BusinessPartnerSchema from './schemas/lifeops/BusinessPartnerSchema.js';
import ServiceSchema from './schemas/lifeops/ServiceSchema.js';
import ServiceTransactionSchema from './schemas/lifeops/ServiceTransactionSchema.js';
import ContactSchema from './schemas/lifeops/ContactSchema.js';

import TaskTypeSchema from './schemas/lifeops/TaskTypeSchema.js';
import TaskStatusSchema from './schemas/lifeops/TaskStatusSchema.js';
import SourceSchema from './schemas/lifeops/SourceSchema.js';
import TaskSchema from './schemas/lifeops/TaskSchema.js';
import TaskScheduleSchema from './schemas/lifeops/TaskScheduleSchema.js';
import PrioritySchema from './schemas/lifeops/PrioritySchema.js';
import ContactTypeSchema from './schemas/lifeops/ContactTypeSchema.js';

import AgentJobSchema from './schemas/lifeops/AgentJobSchema.js';
import AgentJobExecutionSchema from './schemas/lifeops/AgentJobExecutionSchema.js';
import MemorySchema from './schemas/lifeops/MemorySchema.js';
import MemoryTypeSchema from './schemas/lifeops/MemoryTypeSchema.js';
import PurposeSchema from './schemas/lifeops/PurposeSchema.js';
import LifeAreaSchema from './schemas/lifeops/LifeAreaSchema.js';
import HabitSchema from './schemas/lifeops/HabitSchema.js';
import HabitLogSchema from './schemas/lifeops/HabitLogSchema.js';
import DayPlanSchema from './schemas/lifeops/DayPlanSchema.js';
import GoogleConnectionSchema from './schemas/google/GoogleConnectionSchema.js';
import PushDeviceSchema from './schemas/push/PushDeviceSchema.js';
import PushMessageSchema from './schemas/push/PushMessageSchema.js';
import WhatsAppPhoneNumberSchema from './schemas/meta/WhatsAppPhoneNumberSchema.js';
import WhatsAppWebhookEventSchema from './schemas/meta/WhatsAppWebhookEventSchema.js';

//Import schemas

const schemas = [
    GoogleConnectionSchema,
    GoalSchema,
    ProjectSchema,
    BusinessPartnerSchema,
    ServiceSchema,
    ServiceTransactionSchema,
    ContactSchema,
    TaskTypeSchema,
    TaskStatusSchema,
    SourceSchema,
    TaskSchema,
    TaskScheduleSchema,
    PrioritySchema,
    ContactTypeSchema,
    AgentJobSchema,
    AgentJobExecutionSchema,
    MemorySchema,
    MemoryTypeSchema,
    PurposeSchema,
    LifeAreaSchema,
    HabitSchema,
    HabitLogSchema,
    DayPlanSchema,
    PushDeviceSchema,
    PushMessageSchema,
    WhatsAppPhoneNumberSchema,
    WhatsAppWebhookEventSchema,
    //add schemas
];

const generator = new ArchGenerator(schemas);
generator.build()
