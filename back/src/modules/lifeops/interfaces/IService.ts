import type { z } from 'zod';
import type { ServiceBaseSchema, ServiceSchema } from '../schemas/ServiceSchema.js';

type IServiceBase = z.input<typeof ServiceBaseSchema>;
type IService = z.output<typeof ServiceSchema>;
export type { IServiceBase, IService };
