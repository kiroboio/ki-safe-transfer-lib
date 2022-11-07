import { assoc, forEach, isEmpty, isNil } from 'ramda';

import { Type } from '.';
import { ResponseError } from '../types/error';

export function makeApiResponseError(error: unknown): ResponseError {
  /** set default error object */
  let response: ResponseError = { name: 'BadRequest', code: 400, message: 'Unknown API request error' };

  /** if no error provided or it is empty -> return default  */
  if (isNil(error) || isEmpty(error)) return response;

  /** function to check if new data should be assign to the default object */
  function shouldAssign(data: unknown, key: string): boolean {
    /** not if missing */
    if (isNil(data)) return false;

    /** not if empty */
    if (isEmpty(data)) return false;

    /** not if the same */
    if (data === Type<Record<string, unknown>>(response)[key]) return false;

    return true;
  }

  /** assigner function */
  const assignerFn = (data: Record<string, unknown>) => (key: string): void => {
    if (shouldAssign(data[key], key)) response = assoc(key, data[key], response);
  };

  /** run for each of default fields */
  forEach(assignerFn(Type<Record<string, unknown>>(error)), ['name', 'message', 'code', 'data', 'errors']);

  /** try to parse message, in case it has some object inside */
  try {
    const convert = JSON.parse(response.message);

    forEach(assignerFn(convert), Object.keys(convert));
  } catch (err) {
    // No need to do anything
  }

  return response;
}
