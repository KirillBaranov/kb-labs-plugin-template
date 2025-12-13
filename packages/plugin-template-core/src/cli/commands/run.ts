/**
 * Hello Command - CLI surface example
 *
 * Demonstrates defineCommand with typed flags and new UI API:
 * - ctx.ui.success() - for successful results with automatic formatting
 * - ctx.ui.showError() - for errors with rich formatting
 * - ctx.ui.warning() / ctx.ui.info() - for warnings and info messages
 * - ctx.ui.spinner() / ctx.ui.progress() - for progress tracking
 * - ctx.ui.sideBox() / ctx.ui.box() - for formatted output
 * - ctx.ui.colors / ctx.ui.symbols - for styling
 *
 * UI methods are available in all contexts (CLI/REST/Workflow).
 * Verbosity controlled by --quiet, --verbose flags.
 *
 * For pure logging (without formatting), use ctx.logger:
 * - ctx.logger.info() / ctx.logger.debug() / ctx.logger.trace()
 */

import {
  getArtifactId,
  getCommandId,
} from '@kb-labs/plugin-template-contracts';
import { createGreeting } from '../../core/greeting';
import { defineCommand, withAnalytics, useLogger, type CommandResult } from '@kb-labs/sdk';
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

  async handler(ctx: any, argv: string[], flags: TemplateHelloFlags) {
    return await withAnalytics(
      ctx as any,
      'template.hello',
      {
        started: { name: flags.name },
        completed: (result: TemplateHelloResult) => ({
          target: result.result?.target,
          hasResult: Boolean(result.result),
        }),
        failed: (error: Error) => ({ error: error.message }),
      },
      async () => {
        // === NEW: Logging with ctx.ui and useLogger ===
        const logger = useLogger();

        // Info log: visible with --verbose (uses ctx.ui.info for formatted output)
        ctx.ui?.info('Starting Hello Command', {
          summary: {
            'Name': flags.name || 'World',
            'JSON mode': flags.json ? 'yes' : 'no',
          },
        });

        ctx.tracker.checkpoint('greeting');

        // Debug log: visible with --debug (pure logging without formatting)
        logger.debug('Creating greeting message', {
          targetName: flags.name || 'World',
        });

        const greeting = createGreeting(flags.name as string | undefined);
        const payload: HelloCommandResult = {
          message: greeting.message,
          target: greeting.target,
        };

        // Trace log: visible with KB_LOG_LEVEL=trace (most verbose)
        logger.trace('Greeting payload created', payload);

        ctx.tracker.checkpoint('complete');

        // === Output formatting ===
        if (flags.json) {
          // JSON mode: output structured data
          ctx.ui?.json(payload);
        } else {
          // Human-readable mode: use high-level ctx.ui.success() with auto-formatting
          ctx.ui?.success('Hello Command Result', {
            summary: {
              'Message': payload.message,
              'Target': payload.target,
            },
            sections: [
              {
                header: 'Styled Example',
                items: [
                  `Target: ${ctx.ui.colors.accent(payload.target)}`,
                  `Status: ${ctx.ui.symbols.success} Complete`,
                ],
              },
            ],
            timing: ctx.tracker.total(),
          });
        }

        // Return value (for invoke/REST/workflow)
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
