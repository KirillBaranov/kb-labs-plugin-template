import { z } from 'zod';
import { schema } from '@kb-labs/sdk/schema';

export const HelloRequestSchema = z.object({
  name: schema.text({ min: 1 }).optional().default('World'),
});

export type HelloRequest = z.infer<typeof HelloRequestSchema>;

export const HelloResponseSchema = z.object({
  message: schema.text(),
  target: schema.text(),
});

export type HelloResponse = z.infer<typeof HelloResponseSchema>;
