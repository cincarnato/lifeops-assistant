
import { z } from 'zod';


const TaskPriorityBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional()
});

const TaskPrioritySchema = TaskPriorityBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default TaskPrioritySchema;
export {TaskPrioritySchema, TaskPriorityBaseSchema}
