import validator from 'multicoin-address-validator'

import { Sendable, validateReport, ObjectWithStringKeys, QueryOptions } from './types'
import { listOfSettingsKeys, typeOfSettingsKeys, valuesForSettings, TEXT, authDetailsData, validOptions } from './data'
import { makeStringFromTemplate, changeType } from './tools'
import { filter, is as isOf, isNil, isEmpty, keys, forEach, pipe } from 'ramda'
import { is } from './mode'

const isString = (data: unknown): boolean => typeof data === 'string'

interface Props {
  address: string
  currency: string
  networkType: string
}

/**
 * Function to validate crypto address.
 *
 * @function
 * @name validateAddress
 * @param [Object] props
 * @param [string] props.address - address to validate
 * @param [string] props.currency - currency
 * @param [string] props.networkType - network of the currency
 *
 * @returns boolean
 *
 * #### Example
 *
 * ```typescript
 * validateAddress({
            address: 'xxxx',
            currency: 'btc',
            networkType: 'mainnet',
          })
 * ```
 * -
 */
export const validateAddress = ({ address, currency, networkType }: Props): boolean =>
  isString(address) ? validator.validate(address, currency, networkType) : false

export const validateData = (data: Sendable, currency: string, networkType: string): void => {
  const validate: validateReport = {
    message: TEXT.errors.validation.malformedData,
    errors: { [TEXT.errors.validation.missingValues]: [], [TEXT.errors.validation.malformedValues]: [] },
  }

  const pushMissing = (subject: string): number => validate.errors[TEXT.errors.validation.missingValues].push(subject)

  const pushMalformed = (subject: string): number =>
    validate.errors[TEXT.errors.validation.malformedValues].push(subject)

  // checking for missing required values
  if (!data.to) pushMissing('to')

  if (!data.amount) pushMissing('amount')

  if (!data.collect) pushMissing('collect')

  if (!data.deposit) pushMissing('deposit')

  // if all keys present, check for malformed values
  if (!validate.errors[TEXT.errors.validation.missingValues].length) {
    if (!validateAddress({ address: data.to, currency, networkType })) pushMalformed('to')

    if (typeof data.collect !== 'string') pushMalformed('collect')

    if (typeof data.deposit !== 'string') pushMalformed('deposit')

    if (typeof data.amount !== 'number') pushMalformed('amount')

    if (data.from && typeof data.from !== 'string') pushMalformed('from')

    if (data.hint && typeof data.hint !== 'string') pushMalformed('hint')

    if (data.id && typeof data.id !== 'string') pushMalformed('id')
  } else delete validate.errors[TEXT.errors.validation.malformedValues]

  const throwError = (): boolean =>
    validate.errors[TEXT.errors.validation.missingValues].length > 0 ||
    validate.errors[TEXT.errors.validation.malformedValues].length > 0

  // if status false throw error
  if (throwError()) {
    Object.keys(validate.errors).forEach(key => {
      if (validate.errors[key].length > 0) {
        validate.message = `${validate.message} ${key}${validate.errors[key].join(', ')}.`
      }
    })
    throw new TypeError(validate.message)
  }
}

export const validateArray = (arr: unknown[], type: string[]): boolean => {
  if (!Array.isArray(arr)) return false

  let result = true

  arr.forEach(el => {
    if (!type.includes(typeof el)) result = false
  })

  return result
}

export const validateObject = (data: unknown): void => {
  if (isNil(data)) throw new TypeError(TEXT.errors.validation.missingArgument)

  if (data !== Object(data)) throw new TypeError(TEXT.errors.validation.typeOfObject)

  if (Array.isArray(data)) throw new TypeError(TEXT.errors.validation.noArray)

  if (typeof data === 'function') throw new TypeError(TEXT.errors.validation.noFunction)
}

export function validateAuthDetails(details: unknown): void {
  if (!details) throw new TypeError(`${TEXT.errors.validation.missingArgument}: authDetails.`)

  validateObject(details)

  const objKeys = Object.keys(details as ObjectWithStringKeys)

  if (objKeys.length !== 2) {
    throw new TypeError(`${TEXT.errors.validation.malformedData}: authDetails has less or extra keys.`)
  }

  Object.keys(authDetailsData).forEach(key => {
    if (!objKeys.includes(key)) throw new TypeError(`${TEXT.errors.validation.missingValues}${key} (authdetails).`)
  })

  objKeys.forEach(key => {
    const value = (details as ObjectWithStringKeys)[key]

    if (!authDetailsData[key]) {
      throw new TypeError(`${TEXT.errors.validation.unknownKeys}${key} (authdetails).`)
    }

    if (!value) {
      throw new TypeError(`${TEXT.errors.validation.missingValues}${key} (authdetails).`)
    }

    if (typeof value !== authDetailsData[key]) {
      throw new TypeError(
        `${TEXT.errors.validation.typeOfObject}: ${key} can't be of type ${typeof value}, if should be of ${
          authDetailsData[key]
        } type (authdetails).`,
      )
    }
  })
}

export const validateSettings = (settings: unknown): void => {
  if (!settings) throw new TypeError(`${TEXT.errors.validation.missingArgument}: authDetails.`)

  validateObject(settings)

  const setObj = settings as ObjectWithStringKeys

  const objKeys = Object.keys(setObj)

  if (objKeys.length === 0) throw new TypeError(TEXT.errors.validation.emptyObject)

  if (objKeys.length > listOfSettingsKeys.length) throw new TypeError(TEXT.errors.validation.extraKeys)

  objKeys.forEach((key: string) => {
    if (!listOfSettingsKeys.includes(key)) throw new TypeError(`${TEXT.errors.validation.unknownKeys}${key}.`)

    if (key === 'authDetails') {
      validateAuthDetails(setObj[key])
    } else {
      const type = typeOfSettingsKeys[key] as string

      const value = setObj[key] as string | [] | unknown

      if (typeof value !== type)
        throw new TypeError(makeStringFromTemplate(TEXT.errors.validation.wrongValueType, [key, type]))

      const values = valuesForSettings[key] as string[] | number[] | undefined

      if (values && !values.includes(value as never))
        throw new TypeError(
          makeStringFromTemplate(TEXT.errors.validation.wrongValue, [value as string, key, values.join(', ')]),
        )
    }
  })
}

// TODO: finish
// TODO: test
export function checkIf(
  data: unknown,
  type: StringConstructor | ArrayConstructor | BooleanConstructor | NumberConstructor,
): boolean {
  if (isOf(Array, data)) {
    const filterFn = (element: unknown): boolean => {
      return isOf(type, element)
    }

    return filter(filterFn, data as unknown[]).length === (data as unknown[]).length
  }

  return false
}

// TODO: test
export function validateOptions(options: unknown): void {

  /** if empty */
  if (isEmpty(options)) throw new TypeError(makeStringFromTemplate(TEXT.errors.validation.emptyGenObject, ['Options']))

  /** if length is different */
  if (keys(options).length !== keys(validOptions).length) throw new TypeError(makeStringFromTemplate(TEXT.errors.validation.extraGenKeys,['Options']))

  /** check keys */
  const validKeys = keys(validOptions)

  const checkFn = (key: string): void => {

    /** if key doesn't exist */
    if (!validKeys.includes(key))
      throw new TypeError(`${makeStringFromTemplate(TEXT.errors.validation.unknownGenKeys, ['Options'])}${key}`)

    /** if key is of wrong type */
    if (typeof changeType<ObjectWithStringKeys>(options)[key] !== typeof validOptions[key])
      throw new TypeError(
        `${makeStringFromTemplate(TEXT.errors.validation.wrongGenValueType, [
          key,
          'Options',
          typeof validOptions[key],
        ])}`,
      )
  }

  pipe(keys, forEach(checkFn))(options)
}
