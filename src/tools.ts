import { validateObject, validateArray, checkIf } from './validators'
import { ObjectWithStringKeysAnyValues, Sendable, QueryOptions } from './types'
import { assoc, isNil, filter, not } from 'ramda'
import { v4 as generateId } from 'uuid'

// export function not(value: boolean): boolean {
//   if (typeof value === undefined) return false

//   if (typeof value === null) return false

//   if (typeof value !== 'boolean') return false

//   return !value
// }

const splitText = (text: string): string[] => text.split('')

const reassign = (group: string[], position: number, newMember: string): string[] => {
  group.splice(0, 1)
  return [newMember, ...group]
}

export const capitalize = (text: string): string => {
  if (typeof text !== 'string') return ''

  return reassign(splitText(text), 0, splitText(text)[0].toUpperCase()).join('')
}

export const makeStringFromTemplate = (template: string, params: string[]): string => {
  if (typeof template !== 'string') return ''

  if (!validateArray(params, ['string', 'number'])) return ''

  let result = template

  params.forEach((param, key) => {
    result = result.replace(`%${key + 1}`, param)
  })

  return result
}

export const compareBasicObjects = (
  objOne: ObjectWithStringKeysAnyValues<unknown>,
  objTwo: ObjectWithStringKeysAnyValues<unknown>,
): boolean => {
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
export function checkOwnerId(transaction: Sendable): Sendable {
  if (transaction.owner) return transaction

  return assoc('owner', generateId(), transaction)
}

export { generateId }

export function makeOptions(options: QueryOptions | undefined): {} {
  let queryOptions = { $limit: 100, $skip: 0 }

  if (!options) return queryOptions

  if (not(isNil(options.limit))) queryOptions = assoc('$limit', options.limit, queryOptions)

  if (not(isNil(options.skip))) queryOptions = assoc('$skip', options.skip, queryOptions)

  return queryOptions
}
