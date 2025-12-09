/**
 * Hello Command - CLI surface example
 *
 * Demonstrates defineCommand with typed flags and UI utilities.
 */

import {
  getArtifactId,
  getCommandId,
} from '@kb-labs/plugin-template-contracts';
import { createGreeting } from '../../core/greeting';
import { defineCommand, withAnalytics, type CommandResult } from '@kb-labs/sdk';
import { templateHelloFlags, type TemplateHelloFlags } from './flags';

const HELLO_GREETING_ARTIFACT_ID = getArtifactId('template.hello.greeting');

export interface HelloCommandResult {
  message: string;
  target: string;
}

type TemplateHelloResult = CommandResult & {
  result?: HelloCommandResult;
};

export const run = defineCommand<TemplateHelloFlags, TemplateHelloResult>({
  name: getCommandId('plugin-template:hello'),
  flags: templateHelloFlags,

  async handler(ctx, argv, flags) {
    return await withAnalytics(
      ctx as any,
      'template.hello',
      {
        started: { name: flags.name },
        completed: (result) => ({
          target: result.result?.target,
          hasResult: Boolean(result.result),
        }),
        failed: (error) => ({ error: error.message }),
      },
      async () => {
        ctx.tracker.checkpoint('greeting');

        const greeting = createGreeting(flags.name as string | undefined);
        const payload: HelloCommandResult = {
          message: greeting.message,
          target: greeting.target,
        };

        ctx.tracker.checkpoint('complete');

        if (flags.json) {
          ctx.output?.json(payload);
        } else {
          // Use modern UI with sideBox
          const output = ctx.output?.ui.sideBox({
            title: 'Hello',
            sections: [
              {
                items: [payload.message],
              },
              {
                header: 'Details',
                items: ctx.output.ui.keyValue({
                  Target: payload.target,
                }),
              },
            ],
            status: 'success',
            timing: ctx.tracker.total(),
          });
          ctx.output?.write(output + '\n');
        }

        return { ok: true, result: payload };
      }
    );
  },
});

export async function runHelloCommand(
  ctx: Parameters<typeof run>[0],
  argv: Parameters<typeof run>[1],
  flags: Parameters<typeof run>[2]
) {
  return run(ctx, argv, flags);
}
