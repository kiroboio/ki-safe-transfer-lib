import validator from 'multicoin-address-validator'
import { is } from 'ramda'


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
export function validateAddress({ address, currency, networkType }: Props): boolean {

  return is(String,address) ? validator.validate(address, currency, networkType) : false }
