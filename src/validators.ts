import validator from 'multicoin-address-validator'
import { Sendable, validateReport, Settings, ObjectWithStringKeys } from './types'
import { listOfSettingsKeys, typeOfSettingsKeys, valuesForSettings, TEXT } from './data'
import { makeStringFromTemplate } from './tools'

const isString = (data: unknown) => typeof data === 'string'

interface Props {
  address: string
  currency: string
  networkType: string
}

export const validateAddress = ({ address, currency, networkType }: Props): boolean =>
  isString(address) ? validator.validate(address, currency, networkType) : false

export const validateData = (data: Sendable, currency: string, networkType: string): void => {
  const validate: validateReport = {
    message: 'Data is malformed.',
    errors: { 'Missing values:': [], 'Malformed values:': [] },
  }

  const pushMissing = (subject: string) => validate.errors['Missing values:'].push(subject)

  const pushMalformed = (subject: string) => validate.errors['Malformed values:'].push(subject)

  // checking for missing values
  if (!data.to) pushMissing('to')
  if (!data.amount) pushMissing('amount')
  if (!data.collect) pushMissing('collect')
  if (!data.deposit) pushMissing('deposit')

  // checking for malformed values
  // if (data.to && !data.to.match(/^[a-z0-9]+$/i)) validate.errors['Malformed values:'].push('to')
  if (!validateAddress({ address: data.to, currency, networkType })) pushMalformed('to')
  if (typeof data.collect !== 'string') pushMalformed('collect')
  if (typeof data.deposit !== 'string') pushMalformed('deposit')
  if (data.from && typeof data.from !== 'string') pushMalformed('from')
  if (data.hint && typeof data.hint !== 'string') pushMalformed('hint')

  const throwError = () =>
    validate.errors['Missing values:'].length > 0 || validate.errors['Malformed values:'].length > 0

  // if status false throw error
  if (throwError()) {
    Object.keys(validate.errors).forEach(key => {
      if (validate.errors[key].length > 0) {
        validate.message = `${validate.message} ${key} ${validate.errors[key].join(', ')}.`
      }
    })
    throw new Error(validate.message)
  }
}

export const validateSettings = (settings: unknown) => {
  if (settings !== Object(settings)) throw new TypeError(TEXT.errors.validation.typeOfObject)
  if (Array.isArray(settings)) throw new TypeError(TEXT.errors.validation.noArray)
  if (typeof settings === 'function') throw new TypeError(TEXT.errors.validation.noFunction)

  const setObj = settings as ObjectWithStringKeys
  const objKeys = Object.keys(setObj)

  if (objKeys.length === 0) throw new TypeError(TEXT.errors.validation.emptyObject)
  if (objKeys.length > listOfSettingsKeys.length) throw new TypeError(TEXT.errors.validation.extraKeys)

  objKeys.forEach((key: string) => {
    if (!listOfSettingsKeys.includes(key)) throw new TypeError(`${TEXT.errors.validation.unknownKeys}${key}.`)

    const type = typeOfSettingsKeys[key] as string
    const value = setObj[key] as string | [] | any

    if (typeof value !== type)
      throw new TypeError(makeStringFromTemplate(TEXT.errors.validation.wrongValueType, [key, type]))

    const values = valuesForSettings[key] as string[] | number[] | undefined

    // @ts-ignore - some issue, where .includes requires 'never'
    if (values && !values.includes(value))
      throw new TypeError(makeStringFromTemplate(TEXT.errors.validation.wrongValue, [value, key, values.join(', ')]))
  })
}
