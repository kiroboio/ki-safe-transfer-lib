import { assoc, forEach, isNil, isEmpty } from 'ramda'

import { ResponseError } from '..'
import { changeType } from '.'

/**
 * Function to make errors from caught API error objects. Will check argument
 * and try to extract only readable and usable data.
 *
 * @param [unknown] error - object to process with unknown structure
 *
 * @return ResponseError object
 */
function makeApiResponseError(error: unknown): ResponseError {

  /** set default error object */
  let response: ResponseError = { name: 'BadRequest', code: 400, message: 'Unknown API request error' }

  /** if no error provided or it is empty -> return default  */
  if (isNil(error) || isEmpty(error)) return response

  /** function to check if new data should be assign to the default object */
  function shouldAssign(data: unknown, key: string): boolean {

    /** not if missing */
    if (isNil(data)) return false

    /** not if empty */
    if (isEmpty(data)) return false

    /** not if the same */
    if (data === changeType<Record<string, unknown>>(response)[key]) return false

    return true
  }

  /** assigner function */
  const assignerFn = (data: Record<string, unknown>) => (key: string): void => {
    if (shouldAssign(data[key], key)) response = assoc(key, data[key], response)
  }

  /** run for each of default fields */
  forEach(assignerFn(changeType<Record<string, unknown>>(error)), ['name', 'message', 'code', 'data', 'errors'])

  /** try to parse message, in case it has some object inside */
  try {
    const convert = JSON.parse(response.message)

    forEach(assignerFn(convert), Object.keys(convert))
  } catch (err) {
    // No need to do anything
  }

  return response
}

function makePropsResponseError(error: unknown): ResponseError {
  let response: ResponseError = { name: 'BadProps', message: 'Unknown error in props validation' }

  if (!error) return response

  const data = changeType<Record<string, unknown>>(error)

  const fn = (key: string): void => {
    if (key === 'name') {
      if (data.type) response = assoc('name', data.type, response)
    } else {
      if (data[key] && data[key] !== changeType<Record<string, unknown>>(response)[key])
        response = assoc(key, data[key], response)
    }
  }

  forEach(fn, ['name', 'message', 'code', 'data'])

  return response
}

function makeReturnError(message: string, error?: unknown): ResponseError {
  let response: ResponseError = { name: 'ProcessError', message: 'Unknown error in process.' }

  if (!message) return response

  if (error) response = assoc('data', [error], response)

  return assoc('message', message, response)
}

export { makeApiResponseError, makePropsResponseError, makeReturnError }
