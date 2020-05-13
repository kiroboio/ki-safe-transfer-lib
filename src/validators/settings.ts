import { TEXT, listOfSettingsKeys, typeOfSettingsKeys, valuesForSettings } from '../data'
import { validateObject, } from './object'
import {validateAuthDetails} from './auth_details'
import { makeString } from '../tools'
import { KeyObject } from '../types'

export const validateSettings = (settings: unknown): void => {
  if (!settings) throw new TypeError(`${TEXT.errors.validation.missingArgument}: authDetails.`)

  validateObject(settings)

  const setObj = settings as KeyObject<string>

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

      if (typeof value !== type) throw new TypeError(makeString(TEXT.errors.validation.wrongValueType, [key, type]))

      const values = valuesForSettings[key] as string[] | number[] | undefined

      if (values && !values.includes(value as never))
        throw new TypeError(makeString(TEXT.errors.validation.wrongValue, [value as string, key, values.join(', ')]))
    }
  })
}
