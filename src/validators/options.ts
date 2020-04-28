import { isEmpty, keys, pipe, forEach } from 'ramda'

import { makeString, makeLocation, changeType } from '../tools'
import { TEXT, optionsValidValues } from '../data'
import { StringKeyObject } from '..'
import { isOfType } from '../validators'

export function validateOptions(options: unknown, fnName: string): void {

  /** if empty */
  if (isEmpty(options)) throw new TypeError(makeString(TEXT.errors.validation.emptyGenObject, ['Options']))

  /** if length is different */
  if (keys(options).length > keys(optionsValidValues).length)
    throw new TypeError(makeString(TEXT.errors.validation.extraGenKeys, ['Options']))

  /** check keys */
  const validKeys = keys(optionsValidValues)

  const checkFn = (key: string): void => {

    /** if key doesn't exist */
    if (!validKeys.includes(key))
      throw new TypeError(makeString(TEXT.errors.validation.unknownGenKeys, [makeLocation(fnName, 'options')]) + key)

    const value = changeType<StringKeyObject<string>>(options)[key]

    /** if value is of wrong type */
    if (!isOfType(value, optionsValidValues[key].type))
      throw new TypeError(
        `${makeString(TEXT.errors.validation.wrongGenValueType, [
          key,
          makeLocation(fnName, 'options'),
          typeof value,
          optionsValidValues[key].type,
        ])}`,
      )

    const acceptableValues = optionsValidValues[key].values

    // wrongGenValue: 'Wrong value \'%1\' for key \'%2\' in %3. Should be one of: %4.',
    /** if value is not acceptable */
    if (acceptableValues && !acceptableValues.includes(value))
      throw new TypeError(
        `${makeString(TEXT.errors.validation.wrongGenValue, [value, key, 'Options', acceptableValues.join(' or ')])}`,
      )
  }

  pipe(keys, forEach(checkFn))(options)
}
