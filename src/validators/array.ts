import { isNil, not, is } from 'ramda'

import { ERRORS } from '../text'
import { makeString } from '../tools'
import { TEXT } from '../data'
import { validateAddress } from '.'
import { Settings } from '../types'

function validateArray(arr: unknown[], type: string[]): boolean {
  if (!Array.isArray(arr)) return false

  let result = true

  arr.forEach((el) => {
    if (!type.includes(typeof el)) result = false
  })

  return result
}

// TODO: desc
// TODO: test
function validatePropsArray(params: unknown[], type: string, paramName: string, method: string): void {
  if (isNil(params)) throw new TypeError(makeString(ERRORS.validation.missingArgument, [paramName, method]))

  if (not(is(Array, params)))
    throw new TypeError(makeString(ERRORS.validation.wrongTypeArgument, [paramName, method, typeof params, 'string[]']))

  if (!params.length) throw new TypeError(makeString(ERRORS.validation.emptyArgument, [paramName, method]))

  params.forEach((el: unknown, index: number): void => {
    if (typeof el !== type)
      throw new TypeError(
        makeString(ERRORS.validation.wrongTypeArgument, [`#${index}: ${el}`, method, typeof el, type]),
      )
  })
}

function validatePropsAddresses(params: string[], paramName: string, method: string, settings: Settings): void {
  if (isNil(params)) throw new TypeError(makeString(ERRORS.validation.missingArgument, [paramName, method]))

  if (not(is(Array, params)))
    throw new TypeError(makeString(ERRORS.validation.wrongTypeArgument, [paramName, method, typeof params, 'string[]']))

  if (!params.length) throw new TypeError(makeString(ERRORS.validation.emptyArgument, [paramName, method]))

  const fn = (address: string, index: number): void => {
    if (typeof address !== 'string')
      throw new TypeError(
        makeString(ERRORS.validation.wrongTypeArgument, [`#${index}: ${address}`, method, typeof address, 'string']),
      )

    if (
      !validateAddress({
        address,
        currency: settings.currency,
        networkType: settings.network,
      })
    )
      throw new TypeError(makeString(TEXT.validation.notAddress, [address, method, JSON.stringify(settings)]))
  }

  params.forEach(fn)
}

export { validatePropsAddresses, validatePropsArray, validateArray }
