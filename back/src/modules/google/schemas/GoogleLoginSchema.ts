import {z} from 'zod';

const GoogleLoginSchema = z.object({
    credential: z.string().trim().min(1, 'validation.required'),
    rememberMe: z.boolean().optional(),
});

export {GoogleLoginSchema};
