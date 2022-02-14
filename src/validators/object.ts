import { isNil } from 'ramda';

import { ERRORS, MESSAGES } from '../text';
import { makeString, capitalize } from '../tools';

export function validateObject(data: unknown, argName?: string): void {
  if (isNil(data)) throw new TypeError(ERRORS.validation.missingArgument);

  if (data !== Object(data)) throw new TypeError(ERRORS.validation.typeOfObject);

  if (Array.isArray(data))
    throw new TypeError(
      makeString(MESSAGES.validation.cantBe, [argName ? capitalize(argName) : 'Argument', 'array', 'object {}']),
    );

  if (typeof data === 'function') throw new TypeError(ERRORS.validation.noFunction);
}
