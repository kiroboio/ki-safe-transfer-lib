import { validateObject, validateArray } from './validators'
import { ObjectWithStringKeysAnyValues } from './types'

export function not(value: boolean): boolean {
  if (typeof value === undefined) return false

  if (typeof value === null) return false

  if (typeof value !== 'boolean') return false

  return !value
}

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
