import { defineConfig } from 'vitest/config';
import baseConfig from '@kb-labs/devkit/vitest/node.js';

const sharedDir = new URL('./src/shared/', import.meta.url).pathname;
const domainDir = new URL('./src/domain/', import.meta.url).pathname;
const applicationDir = new URL('./src/application/', import.meta.url).pathname;
const infrastructureDir = new URL('./src/infrastructure/', import.meta.url).pathname;

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    globals: true,
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.spec.ts']
  },
  resolve: {
    alias: {
      '@app/shared': sharedDir + 'index.ts',
      '@app/shared/*': sharedDir + '*',
      '@app/domain': domainDir + 'index.ts',
      '@app/domain/*': domainDir + '*',
      '@app/application': applicationDir + 'index.ts',
      '@app/application/*': applicationDir + '*',
      '@app/infrastructure': infrastructureDir + 'index.ts',
      '@app/infrastructure/*': infrastructureDir + '*'
    }
  }
});
