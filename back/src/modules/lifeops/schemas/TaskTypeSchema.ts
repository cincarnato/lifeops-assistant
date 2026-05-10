
import { z } from 'zod';


const TaskTypeBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional()
});

const TaskTypeSchema = TaskTypeBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default TaskTypeSchema;
export {TaskTypeSchema, TaskTypeBaseSchema}
