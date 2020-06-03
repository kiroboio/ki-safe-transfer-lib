import { assoc, isNil, not, map, keys, includes, forEach } from 'ramda'
import { v4 as generateId } from 'uuid'

import { validateArray, validateObject } from '../validators'
import { SendRequest, QueryOptions, Watch, Address } from '..'

const splitText = (text: string): string[] => text.split('')

const reassign = (group: string[], position: number, newMember: string): string[] => {
  group.splice(0, 1)
  return [newMember, ...group]
}

export const capitalize = (text: string): string => {
  if (typeof text !== 'string') return ''

  return reassign(splitText(text), 0, splitText(text)[0].toUpperCase()).join('')
}

export const makeString = (template: string, params: string[]): string => {
  if (typeof template !== 'string') return ''

  if (!validateArray(params, ['string', 'number'])) return ''

  let result = template

  params.forEach((param, key) => {
    result = result.replace(`%${key + 1}`, param)
  })

  return result
}

export function checkSettings(settings: Record<string, unknown>): boolean {
  const CONTROL_SET = {
    authDetails: true,
    currency: 'btc',
    debug: 2,
    eventBus: true,
    lastAddresses: {
      addresses: ['string'],
      options: undefined,
    },
    network: 'testnet',
    respondAs: 'direct',
    version: 'v1',
  }

  // check if object
  validateObject(settings)

  // check keys
  const settingsKeys = keys(settings)

  const controlKeys = keys(CONTROL_SET)

  if (settingsKeys.length !== controlKeys.length) return false

  const forEachFn = (key: string | number): void => {
    if (not(includes(key, controlKeys))) throw new Error(`wrong key: ${key}`)
  }

  forEach(forEachFn, settingsKeys)

  // check value types and values

  if (settings['authDetails'] !== CONTROL_SET.authDetails)
    throw new Error(`authDetails is wrong: ${settings['authDetails']}`)

  if (settings['currency'] !== CONTROL_SET.currency) throw new Error(`currency is wrong: ${settings['currency']}`)

  if (settings['debug'] !== CONTROL_SET.debug) throw new Error(`debug is wrong: ${settings['debug']}`)

  if (settings['eventBus'] !== CONTROL_SET.eventBus) throw new Error(`eventBus is wrong: ${settings['eventBus']}`)

  if (settings['network'] !== CONTROL_SET.network) throw new Error(`network is wrong: ${settings['network']}`)

  if (settings['respondAs'] !== CONTROL_SET.respondAs) throw new Error(`respondAs is wrong: ${settings['respondAs']}`)

  if (settings['version'] !== CONTROL_SET.version) throw new Error(`version is wrong: ${settings['version']}`)

  validateObject(settings['lastAddresses'])

  if ((settings['lastAddresses'] as { addresses: string[] })['addresses'].length !== 0)
    throw new Error(`lastAddresses is wrong: ${settings['lastAddresses']}`)

  return true
}

export const compareBasicObjects = (objOne: Record<string, unknown>, objTwo: Record<string, unknown>): boolean => {
  let result = true

  try {
    // validation
    validateObject(objOne)
    validateObject(objTwo)

    if (Object.keys(objOne).length !== Object.keys(objTwo).length) return false

    Object.keys(objOne).forEach((key) => {
      if (objOne[key] !== objTwo[key]) result = false
    })
  } catch (e) {
    result = false
  }

  return result
}

export function changeType<T>(object: unknown): T {
  return (object as unknown) as T
}

// TODO: add test
/**
 * Function to check the presence of 'owner' ID and to add auto-generated
 * one, if not present.
 *
 * @function
 * @name checkOwnerId
 * @param [Sendable] transaction - transaction
 *
 * @returns Sendable
 */
export function checkOwnerId(transaction: SendRequest): SendRequest {
  if (transaction.owner) return transaction

  return assoc('owner', generateId(), transaction)
}

export { generateId }

export function makeOptions(
  options: QueryOptions | undefined,
  globalWatch: Watch | undefined,
): Record<string, unknown> {
  let queryOptions = { $limit: 100, $skip: 0 }

  if (!options) return queryOptions

  if (not(isNil(options.limit))) queryOptions = assoc('$limit', options.limit, queryOptions)

  if (not(isNil(options.skip))) queryOptions = assoc('$skip', options.skip, queryOptions)

  // if 'watch' is provided -> chose either, prefer inline
  if (options.watch || globalWatch) {
    if (options.watch) queryOptions = assoc('watch', options.watch, queryOptions)
    else if (globalWatch) queryOptions = assoc('watch', globalWatch, queryOptions)
  }

  return queryOptions
}

/**
 * Function to flatten the reply from the API, converting array of
 * objects with key 'address' to array of strings - array of addresses
 *
 * @param [Array] data - array of Address objects
 *
 * @returns [Array] - array of strings
 *
 * #### Example:
 *
 * ```typescript
 * const usedAddresses = flattenAddresses(payload.data as Address[])
 * ```
 */
export function flattenAddresses(data: Address[]): string[] {
  const mapperFn = (el: Address): string => el.address

  return map(mapperFn, data)
}

/** creates 'fnName function's options ' */
export function makeLocation(fn: string, block: string): string {
  return `${fn ? '\'' + fn + '\' function\'s ' : ''}${block ? block : ''}`
}
