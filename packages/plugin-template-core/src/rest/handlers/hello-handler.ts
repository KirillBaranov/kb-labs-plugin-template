import { getArtifactId } from '@kb-labs/plugin-template-contracts';
import { defineRestHandler, type RestHandlerContext } from '@kb-labs/sdk/rest';
import { createGreeting } from '../../core/greeting';
import type { HelloRequest, HelloResponse } from '../schemas/hello-schema';
import { HelloRequestSchema, HelloResponseSchema } from '../schemas/hello-schema';

const HELLO_GREETING_ARTIFACT_ID = getArtifactId('template.hello.greeting');

/**
 * Hello REST handler
 */
export const handleHello = defineRestHandler({
  name: 'template:hello',
  input: HelloRequestSchema,
  output: HelloResponseSchema,

  async handler(request: HelloRequest, ctx: RestHandlerContext) {
    const greeting = createGreeting(request.name as string | undefined);

    ctx.log('info', 'Hello REST endpoint executed', {
      requestId: ctx.requestId,
      target: greeting.target,
      produces: [HELLO_GREETING_ARTIFACT_ID],
    });

    return { message: greeting.message, target: greeting.target };
  },
});
