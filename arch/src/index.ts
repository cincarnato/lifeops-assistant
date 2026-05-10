import { ArchGenerator } from '@drax/arch';
import GoalSchema from './schemas/lifeops/GoalSchema.js';
import ProjectSchema from './schemas/lifeops/ProjectSchema.js';
import ClientSchema from './schemas/lifeops/ClientSchema.js';
import ContactSchema from './schemas/lifeops/ContactSchema.js';
import CompanySchema from './schemas/lifeops/CompanySchema.js';
import TaskTypeSchema from './schemas/lifeops/TaskTypeSchema.js';
import TaskStatusSchema from './schemas/lifeops/TaskStatusSchema.js';
import TaskPrioritySchema from './schemas/lifeops/TaskPrioritySchema.js';
import TaskSourceSchema from './schemas/lifeops/TaskSourceSchema.js';
import TaskSchema from './schemas/lifeops/TaskSchema.js';

//Import schemas

const schemas = [
    GoalSchema,
    ProjectSchema,
    ClientSchema,
    ContactSchema,
    CompanySchema,
    TaskTypeSchema,
    TaskStatusSchema,
    TaskPrioritySchema,
    TaskSourceSchema,
    TaskSchema,
    //add schemas
];

const generator = new ArchGenerator(schemas);
generator.build()
