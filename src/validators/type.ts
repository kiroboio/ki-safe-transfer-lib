import { isNil } from 'ramda'

export function isOfType(value: unknown, type: string): boolean {
  if (isNil(value) || !type) return false

  return typeof value === type
}
