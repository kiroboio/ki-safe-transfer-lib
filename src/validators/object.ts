import { isNil } from 'ramda'
import { TEXT } from 'src/data'
import { makeString, capitalize } from 'src/tools'

export const validateObject = (data: unknown, argName?: string): void => {
  if (isNil(data)) throw new TypeError(TEXT.errors.validation.missingArgument)

  if (data !== Object(data)) throw new TypeError(TEXT.errors.validation.typeOfObject)

  if (Array.isArray(data))
    throw new TypeError(makeString(TEXT.validation.cantBe, [argName ? capitalize(argName) : 'Argument', 'array']))

  if (typeof data === 'function') throw new TypeError(TEXT.errors.validation.noFunction)
}
