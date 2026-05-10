
import { z } from 'zod';


const TaskStatusBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional()
});

const TaskStatusSchema = TaskStatusBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default TaskStatusSchema;
export {TaskStatusSchema, TaskStatusBaseSchema}
