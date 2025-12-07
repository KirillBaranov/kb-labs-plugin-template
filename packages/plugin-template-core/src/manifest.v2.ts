import { defineManifest, defineCommandFlags, permissions } from '@kb-labs/shared-command-kit';
import { generateExamples } from '@kb-labs/plugin-manifest';
import { pluginContractsManifest } from '../../plugin-template-contracts/dist/index';
import { templateHelloFlags } from './cli/commands/flags';

// Level 2: Типизация через contracts для автодополнения и проверки ID
export const manifest = defineManifest({
  schema: 'kb.plugin/2',
  id: '@kb-labs/plugin-template',
  version: '0.1.0',
  display: {
    name: 'Plugin Template',
    description: 'HelloWorld reference plugin demonstrating CLI, REST, and Studio surfaces.',
    tags: ['template', 'hello', 'sample']
  },
  setup: {
    handler: './lifecycle/setup.js#run',
    describe: 'Create starter .kb assets and default config for the template plugin.',
    permissions: permissions.combine(
      permissions.presets.pluginWorkspace('template'),
      {
        quotas: {
          timeoutMs: 5000,
          memoryMb: 64,
          cpuMs: 2500,
        },
      }
    ),
  },
  cli: {
    commands: [
      {
        id: 'plugin-template:hello',
        group: 'plugin-template',
        describe: 'Print a hello message from the plugin template.',
        longDescription: 'Outputs a scoped greeting and optional target using shared formatting utilities.',
        flags: defineCommandFlags(templateHelloFlags), // Level 2.3+: Переиспользование типов из команды
        examples: generateExamples('hello', 'plugin-template', [
          { description: 'Basic greeting', flags: {} },
          { description: 'Greet specific name', flags: { name: 'Dev' } },
          { description: 'Output as JSON', flags: { json: true } }
        ]),
        handler: './cli/commands/run.js#runHelloCommand'
      }
    ]
  },
  rest: {
    basePath: '/v1/plugins/template',
    routes: [
      {
        method: 'GET',
        path: '/hello',
        input: {
          zod: './rest/schemas/hello-schema.js#HelloRequestSchema'
        },
        output: {
          zod: './rest/schemas/hello-schema.js#HelloResponseSchema'
        },
        handler: './rest/handlers/hello-handler.js#handleHello',
        permissions: permissions.combine(
          permissions.presets.pluginWorkspaceRead('template'),
          {
            quotas: {
              timeoutMs: 5000,
              memoryMb: 64,
              cpuMs: 2500,
            },
          }
        ),
      }
    ]
  },
  studio: {
    widgets: [
      {
        id: 'template.hello',
        kind: 'card',
        title: 'Hello Template',
        description: 'Displays greeting output returned by the hello REST route.',
        data: {
          source: {
            type: 'rest',
            routeId: '/hello',
            method: 'GET'
          },
          schema: {
            zod: './rest/schemas/hello-schema.js#HelloResponseSchema'
          }
        },
        layoutHint: {
          w: 3,
          h: 2,
          minW: 2,
          minH: 2
        }
      }
    ],
    menus: [
      {
        id: 'template-hello',
        label: 'Template · Hello',
        target: '/plugins/template/hello',
        order: 0
      }
    ],
    layouts: [
      {
        id: 'template.dashboard',
        kind: 'grid',
        title: 'Template Dashboard',
        description: 'Starter layout that highlights the Hello widget.',
        config: {
          cols: {
            sm: 2,
            md: 4,
            lg: 6
          },
          rowHeight: 6
        }
      }
    ]
  },
  jobs: [
    {
      id: 'hello-cron',
      handler: './jobs/hello.js#run',
      schedule: '*/1 * * * *', // Every minute (для демо)
      describe: 'Says hello every minute and writes to log file (sandboxed)',
      enabled: true,
      priority: 5,
      timeout: 10000,
      retries: 2,
      tags: ['demo', 'hello'],

      // ✅ SECURITY: Permissions для job (запуск в sandbox)
      permissions: permissions.combine(
        permissions.presets.pluginWorkspace('template'), // Доступ к .kb/template/
        {
          // CRITICAL: shell permissions needed for fs enforcement via ctx.runtime.fs
          shell: {
            allow: [],  // No shell commands allowed
            deny: ['**'],  // Deny all shell commands
          },
          capabilities: ['shell-exec'],  // Required для ctx.runtime.fs
          quotas: {
            timeoutMs: 10000,  // 10 seconds timeout
            memoryMb: 64,      // 64 MB memory limit
            cpuMs: 5000,       // 5 seconds CPU time
          },
        }
      ),
    },
  ],
  capabilities: [],
  permissions: permissions.combine(
    permissions.presets.pluginWorkspaceRead('template'),
    {
      quotas: {
        timeoutMs: 10000,
        memoryMb: 128,
        cpuMs: 5000,
      },
    }
  ),
  artifacts: []
});

export default manifest;
