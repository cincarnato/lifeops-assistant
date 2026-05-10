
import { z } from 'zod';


const TaskSourceBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional()
});

const TaskSourceSchema = TaskSourceBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default TaskSourceSchema;
export {TaskSourceSchema, TaskSourceBaseSchema}
