import type { z } from 'zod';
import type { ServiceTransactionBaseSchema, ServiceTransactionSchema } from '../schemas/ServiceTransactionSchema.js';

type IServiceTransactionBase = z.input<typeof ServiceTransactionBaseSchema>;
type IServiceTransaction = z.output<typeof ServiceTransactionSchema>;
export type { IServiceTransactionBase, IServiceTransaction };
