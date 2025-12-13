/**
 * Test Loader Command - Demonstrates UI loader/spinner functionality
 *
 * Shows examples of:
 * - useLoader() hook - Spinner with start/stop/update/succeed/fail
 * - Single continuous loader - For quick tasks (loading, processing)
 * - Multi-stage progress - For complex operations with multiple steps
 * - Different scenarios: success, failure, rapid updates
 */

import { defineCommand, useLoader, type CommandResult } from '@kb-labs/sdk';
import { getCommandId } from '@kb-labs/plugin-template-contracts';

export interface TestLoaderFlags {
  duration?: number;
  fail?: boolean;
  stages?: number;
}

const testLoaderFlags = {
  duration: {
    type: 'number',
    description: 'Duration of each stage in milliseconds',
    default: 2000,
    alias: 'd',
  },
  fail: {
    type: 'boolean',
    description: 'Simulate failure scenario',
    default: false,
    alias: 'f',
  },
  stages: {
    type: 'number',
    description: 'Number of progress stages to simulate',
    default: 3,
    alias: 's',
  },
} as const;

type TestLoaderResult = CommandResult & {
  result?: {
    completed: boolean;
    stagesRun: number;
  };
};

export const runTestLoader = defineCommand<typeof testLoaderFlags, TestLoaderResult>({
  name: getCommandId('plugin-template:test-loader'),
  flags: testLoaderFlags,

  async handler(ctx: any, argv: string[], flags: any) {
    const duration = flags.duration ?? 2000;
    const shouldFail = flags.fail ?? false;
    const stagesCount = flags.stages ?? 3;

    ctx.ui?.info('🧪 Testing Loader/Spinner functionality', {
      summary: {
        'Duration per stage': `${duration}ms`,
        'Stages': stagesCount,
        'Fail scenario': shouldFail ? 'yes' : 'no',
      },
    });

    // ===== 1. Single Continuous Loader (no stages) =====
    ctx.ui?.headline('1. Single Continuous Loader (ideal for quick tasks)');

    const loader = useLoader('Loading data...');
    loader.start();

    await sleep(duration / 5);

    loader.update({ text: 'Processing items...' });
    await sleep(duration / 5);

    loader.update({ text: 'Validating results...' });
    await sleep(duration / 5);

    loader.update({ text: 'Finalizing...' });
    await sleep(duration / 5);

    loader.succeed('Data loaded successfully!');

    await sleep(500);

    // ===== 2. Multi-Stage Progress Test =====
    ctx.ui?.headline('2. Multi-Stage Progress (for complex operations)');

    for (let i = 1; i <= stagesCount; i++) {
      const spinner = useLoader(`Stage ${i}/${stagesCount}: Starting...`);
      spinner.start();

      await sleep(duration / 4);
      spinner.update({ text: `Stage ${i}/${stagesCount}: 25% complete` });

      await sleep(duration / 4);
      spinner.update({ text: `Stage ${i}/${stagesCount}: 50% complete` });

      await sleep(duration / 4);
      spinner.update({ text: `Stage ${i}/${stagesCount}: 75% complete` });

      await sleep(duration / 4);

      // Complete or fail stage
      if (shouldFail && i === Math.floor(stagesCount / 2)) {
        spinner.fail(`Stage ${i}/${stagesCount}: Failed!`);
        break;
      } else {
        spinner.succeed(`Stage ${i}/${stagesCount}: Complete!`);
      }
    }

    await sleep(500);

    // ===== Final Result =====
    const result = {
      completed: !shouldFail || stagesCount === 0,
      stagesRun: shouldFail ? Math.floor(stagesCount / 2) : stagesCount,
    };

    ctx.ui?.success('Loader Test Complete', {
      summary: {
        'Status': result.completed ? 'Success' : 'Failed (simulated)',
        'Stages completed': `${result.stagesRun}/${stagesCount}`,
      },
      sections: [
        {
          header: 'Test Coverage',
          items: [
            `${ctx.ui.symbols.success} Single continuous loader (reactive updates)`,
            `${ctx.ui.symbols.success} Multi-stage progress (complex operations)`,
            `${ctx.ui.symbols.success} Success/Failure scenarios`,
          ],
        },
      ],
    });

    return { ok: true, result };
  },
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runTestLoaderCommand(
  ctx: Parameters<typeof runTestLoader>[0],
  argv: Parameters<typeof runTestLoader>[1],
  flags: Parameters<typeof runTestLoader>[2]
) {
  return runTestLoader(ctx, argv, flags);
}
