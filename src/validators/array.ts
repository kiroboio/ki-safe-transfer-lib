import { isNil, not, is, forEach } from 'ramda'

import { makeString } from '../tools'
import { TEXT } from '../data'
import { Settings } from 'src/types'
import { validateAddress } from '.'

// TODO: desc
// TODO: test
 function validatePropsArray(params: unknown[], type: string, paramName: string, method: string): void {
  if (isNil(params))
    throw new TypeError(
      makeString(TEXT.validation.params, [paramName, method, 'missing or undefined/null', 'string[]']),
    )

  if (not(is(Array, params)))
    throw new TypeError(makeString(TEXT.validation.params, [paramName, method, typeof params, 'string[]']))

  if (!params.length) throw new TypeError(makeString(TEXT.validation.empty, [paramName, method]))

  const fn = (el: unknown): void => {
    if (typeof el !== type)
      throw new TypeError(makeString(TEXT.validation.params, [`Element (${el})`, method, typeof el, 'string']))
  }

  forEach(fn, params)
}

function validatePropsAddresses(params: string[], paramName: string, method: string,settings: Settings): void {
   if (isNil(params))
     throw new TypeError(
       makeString(TEXT.validation.params, [paramName, method, 'missing or undefined/null', 'string[]']),
     )

   if (not(is(Array, params)))
     throw new TypeError(makeString(TEXT.validation.params, [paramName, method, typeof params, 'string[]']))

   if (!params.length) throw new TypeError(makeString(TEXT.validation.empty, [paramName, method]))

   const fn = (address: string): void => {
     if (typeof address !== 'string')
       throw new TypeError(makeString(TEXT.validation.params, [`Element (${address})`, method, typeof address, 'string']))

     if (!validateAddress({
            address,
            currency: settings.currency,
            networkType: settings.network,
          })) throw new TypeError(makeString(TEXT.validation.notAddress, [address, method, JSON.stringify(settings)]))
   }

  forEach(fn, params)

}

export { validatePropsAddresses ,validatePropsArray}