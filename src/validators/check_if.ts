import { filter, is } from 'ramda'

// TODO: test
export function checkIf(
  data: unknown,
  type: StringConstructor | ArrayConstructor | BooleanConstructor | NumberConstructor,
): boolean {
  if (is(Array, data)) {
    const filterFn = (element: unknown): boolean => {
      return is(type, element)
    }

    return filter(filterFn, data as unknown[]).length === (data as unknown[]).length
  }

  return false
}
