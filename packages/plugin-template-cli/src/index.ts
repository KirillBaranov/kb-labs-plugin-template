// Main barrel export for @kb-labs/plugin-template

// Re-export everything for plugin consumers
export * from './cli';
export * from './rest';
export * from './core';
export * from './utils';
export * from './studio';

// Named export for setup to avoid conflict with cli/commands/run
export { run as setupHandler } from './setup-handler';
