import { createGreeting } from '@app/domain';
import { DEFAULT_GREETING_TARGET } from '@app/shared';

export interface CreateGreetingInput {
  name?: string;
  message?: string;
}

export function createGreetingUseCase(input: CreateGreetingInput = {}) {
  const target = input.name?.trim() || DEFAULT_GREETING_TARGET;
  const message = input.message ?? `Hello, ${target}!`;

  return createGreeting(target, message);
}


