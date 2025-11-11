import { createGreetingUseCase } from '@app/application';
import { createConsoleLogger, type Logger } from '@app/infrastructure';

export interface HelloCommandArgs {
  name?: string;
  json?: boolean;
}

export interface HelloCommandContext {
  logger?: Logger;
  stdout?: NodeJS.WritableStream;
}

export interface HelloCommandResult {
  message: string;
  target: string;
}

export async function runHelloCommand(
  args: HelloCommandArgs = {},
  context: HelloCommandContext = {}
): Promise<HelloCommandResult> {
  const greeting = createGreetingUseCase({ name: args.name });
  const payload: HelloCommandResult = {
    message: greeting.message,
    target: greeting.target
  };

  const logger = context.logger ?? createConsoleLogger('template:hello');
  const stdout = context.stdout ?? process.stdout;

  if (args.json) {
    stdout.write(`${JSON.stringify(payload)}\n`);
  } else {
    stdout.write(`${payload.message}\n`);
  }

  logger.log('info', 'Hello command executed', { target: payload.target, json: Boolean(args.json) });
  return payload;
}


