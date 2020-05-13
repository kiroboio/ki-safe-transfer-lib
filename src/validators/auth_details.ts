import { TEXT, authDetailsData } from '../data'
import { validateObject } from './object'
import { KeyObject } from '../types'

export function validateAuthDetails(details: unknown): void {
  if (!details) throw new TypeError(`${TEXT.errors.validation.missingArgument}: authDetails.`)

  validateObject(details)

  const objKeys = Object.keys(details as KeyObject<string>)

  if (objKeys.length !== 2) {
    throw new TypeError(`${TEXT.errors.validation.malformedData}: authDetails has less or extra keys.`)
  }

  Object.keys(authDetailsData).forEach(key => {
    if (!objKeys.includes(key)) throw new TypeError(`${TEXT.errors.validation.missingValues}${key} (authdetails).`)
  })

  objKeys.forEach(key => {
    const value = (details as KeyObject<string>)[key]

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
