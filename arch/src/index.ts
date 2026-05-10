import { ArchGenerator } from '@drax/arch';
import GoalSchema from './schemas/lifeops/GoalSchema.js';
import ProjectSchema from './schemas/lifeops/ProjectSchema.js';
import ClientSchema from './schemas/lifeops/ClientSchema.js';
import ContactSchema from './schemas/lifeops/ContactSchema.js';
import CompanySchema from './schemas/lifeops/CompanySchema.js';
import TaskTypeSchema from './schemas/lifeops/TaskTypeSchema.js';
import TaskStatusSchema from './schemas/lifeops/TaskStatusSchema.js';
import TaskSourceSchema from './schemas/lifeops/TaskSourceSchema.js';
import TaskSchema from './schemas/lifeops/TaskSchema.js';
import PrioritySchema from './schemas/lifeops/PrioritySchema.js';

//Import schemas

const schemas = [
    GoalSchema,
    ProjectSchema,
    ClientSchema,
    ContactSchema,
    CompanySchema,
    TaskTypeSchema,
    TaskStatusSchema,
    TaskSourceSchema,
    TaskSchema,
    PrioritySchema,
    //add schemas
];

const generator = new ArchGenerator(schemas);
generator.build()
