import { assoc, isNil, not, map } from 'ramda'
import { v4 as generateId } from 'uuid'

import { validateObject, validateArray } from '../validators'
import { QueryOptions, KeyObject, Address, SendRequest, Watch } from '../types'

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

export const compareBasicObjects = (objOne: KeyObject<unknown>, objTwo: KeyObject<unknown>): boolean => {
  let result = true

  try {
    // validation
    validateObject(objOne)
    validateObject(objTwo)

    if (Object.keys(objOne).length !== Object.keys(objTwo).length) return false

    Object.keys(objOne).forEach(key => {
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

export function makeOptions(options: QueryOptions | undefined, globalWatch: Watch | undefined): {} {
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