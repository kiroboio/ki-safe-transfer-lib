import { isNil, keys, forEach } from 'ramda'

import { TEXT } from '../data'
import { makeString, capitalize, changeType } from '../tools'


function validateObject(data: unknown, argName?: string): void {
  if (isNil(data)) throw new TypeError(TEXT.errors.validation.missingArgument)

  if (data !== Object(data)) throw new TypeError(TEXT.errors.validation.typeOfObject)

  if (Array.isArray(data))
    throw new TypeError(
      makeString(TEXT.validation.cantBe, [argName ? capitalize(argName) : 'Argument', 'array', 'object {}']),
    )

  if (typeof data === 'function') throw new TypeError(TEXT.errors.validation.noFunction)
}

function validateObjectWithStrings(params: Record<string,unknown>, paramName: string, method: string): void {
  if (!paramName || !method)
    throw new TypeError(
      makeString(TEXT.validation.cantBe, [
        paramName || 'paramName or method',
        'empty for "validateObjectWithStrings" method',
        'paramName: string, method: string',
      ]),
    )

  if (isNil(params))
    throw new TypeError(
      makeString(TEXT.validation.params, [
        paramName,
        method,
        'missing or undefined/null',
        '{ [index:string]: string }',
      ]),
    )

  if (Array.isArray(params))
    throw new TypeError(
      makeString(TEXT.validation.params, [paramName, method, 'array', 'object {[index:string]:string}']),
    )

  if (typeof params === 'function')
    throw new TypeError(
      makeString(TEXT.validation.params, [paramName, method, 'function', 'object {[index:string]:string}']),
    )

  if (params !== Object(params))
    throw new TypeError(
      makeString(TEXT.validation.params, [paramName, method, typeof params, 'object {[index:string]:string}']),
    )

  if (!keys(params).length) throw new TypeError(makeString(TEXT.validation.empty, [paramName, method]))

  const data = changeType<Record<string, string>>(params)

  const fn = (key: string): void => {
    if (typeof data[key] !== 'string')
      throw new TypeError(makeString(TEXT.validation.params, [`Element ${key}`, method, typeof data[key], 'string']))

    if (!data[key])
      throw new TypeError(
        makeString(TEXT.validation.params, [`Element ${key}`, method, 'empty', 'value in string form']),
      )
  }

  forEach(fn, keys(data) as string[])
}

export { validateObjectWithStrings, validateObject }
