import { assoc, forEach, omit, concat } from 'ramda'

import { ResponseError, StringKeyObject } from '../types'
import { changeType } from '.'

function makeApiResponseError(error: unknown): ResponseError {
  let response: ResponseError = { name: 'BadRequest', code: 400, message: 'Unknown API request error' }

  if (!error) return response

  const data = changeType<StringKeyObject<unknown>>(error)

  const fn = (key: string): void => {
    if (data[key] && data[key] !== changeType<StringKeyObject<unknown>>(response)[key])

      response = assoc(key, data[key], response)
  }

  forEach(fn, ['name', 'message', 'code', 'data'])

  return response
}

function makePropsResponseError(error: unknown): ResponseError {
  let response: ResponseError = { name: 'BadProps', message: 'Unknown error in props validation' }

  if (!error) return response

  const data = changeType<StringKeyObject<unknown>>(error)

  const fn = (key: string): void => {
    if (key === 'name') {
      if (data.type) response = assoc('name', data.type, response)
    } else {
      if (data[key] && data[key] !== changeType<StringKeyObject<unknown>>(response)[key])
        response = assoc(key, data[key], response)
    }
  }

  forEach(fn, ['name', 'message', 'code', 'data'])

  return response
}

function makeReturnError(message: string, error?: unknown): ResponseError {
  let response: ResponseError = { name: 'ProcessError', message: 'Unknown error in process.' }

  if (!message) return response

  if (error) response = assoc('data',[error],response)

  return assoc('message', message, response)
}


function isResponseError(error: ResponseError): boolean {
  if (!error.name || !error.message) return false

  return true
}

function stackErrors(newError: ResponseError, prevError?: ResponseError): ResponseError {
  if (!newError || !isResponseError(newError))
    throw new Error('Unknown error in service. Unable to form error object.')

  if (!prevError || !isResponseError(prevError)) return newError

  let error = { data: [], ...newError }

  /** add previous error as data, after new error's data */
  error = assoc('data', concat(error.data, [omit(['data'], prevError)]), error)

  /** if previous error had data -> add it at the end of the array */
  if (prevError.data) {
    error = assoc('data', concat(error.data, prevError.data), error)
  }

  return error
}

export { makeApiResponseError, makePropsResponseError, makeReturnError,stackErrors }
