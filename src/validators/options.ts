import { isEmpty, keys, pipe, forEach } from 'ramda'

import { makeString, makeLocation, changeType } from '../tools'
import { TEXT, optionsRequestValidValues, optionsValidValues } from '../data'
import { isOfType } from '.'
import { ERRORS } from '../text'

export function validateOptions(options: unknown, fnName: string, request?: true): void {

  /** if empty */
  if (isEmpty(options)) throw new TypeError(makeString(TEXT.errors.validation.emptyGenObject, ['Options']))

  const valid = request ? optionsRequestValidValues : optionsValidValues

  /** if length is different */
  if (keys(options).length > keys(valid).length)
    throw new TypeError(makeString(TEXT.errors.validation.extraGenKeys, ['Options']))

  /** check keys */
  const validKeys = keys(valid)

  const checkFn = (key: string): void => {

    /** if key doesn't exist */
    if (!validKeys.includes(key)) throw new TypeError(makeString(ERRORS.validation.extraKey, [key, 'options', fnName]))

    const value = changeType<Record<string, string>>(options)[key]

    /** if value is of wrong type */
    if (!isOfType(value, valid[key].type))
      throw new TypeError(
        `${makeString(TEXT.errors.validation.wrongGenValueType, [
          key,
          makeLocation(fnName, 'options'),
          typeof value,
          valid[key].type,
        ])}`,
      )

    const acceptableValues = valid[key].values

    // wrongGenValue: 'Wrong value \'%1\' for key \'%2\' in %3. Should be one of: %4.',
    /** if value is not acceptable */
    if (acceptableValues && !acceptableValues.includes(value))
      throw new TypeError(
        `${makeString(TEXT.errors.validation.wrongGenValue, [value, key, 'Options', acceptableValues.join(' or ')])}`,
      )
  }

  pipe(keys, forEach(checkFn))(options)
}
