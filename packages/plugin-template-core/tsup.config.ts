import { defineConfig } from 'tsup';
import nodePreset from '@kb-labs/devkit/tsup/node.js';

export default defineConfig({
  ...nodePreset,
  tsconfig: "tsconfig.build.json", // Use build-specific tsconfig without paths
  entry: [
    'src/index.ts',
    'src/manifest.v2.ts',
    'src/lifecycle/setup.ts',
    'src/cli/commands/run.ts',
    'src/cli/commands/test-loader.ts',
    'src/rest/handlers/hello-handler.ts',
    'src/rest/schemas/hello-schema.ts',
    'src/studio/widgets/hello-widget.tsx',
    'src/jobs/hello.ts'
  ],
  external: [
    '@kb-labs/plugin-manifest',
    '@kb-labs/shared-cli-ui',
    '@kb-labs/core-platform',
    'react',
    'react-dom'
  ],
  dts: {
    resolve: true,
  },
  esbuildOptions(options) {
    options.jsx = 'automatic';
    return options;
  }
});
