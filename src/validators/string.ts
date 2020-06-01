import { not, is, isNil } from 'ramda'

import { makeString } from '@src/tools'
import { TEXT } from '@src/data'

// TODO: desc
// TODO: test
export function validatePropsString(params: unknown, paramName: string, method: string): void {

  if (isNil(params))
    throw new TypeError(makeString(TEXT.validation.params, [paramName, method, 'missing or undefined/null', 'string']))

  if (not(is(String, params)))
    throw new TypeError(makeString(TEXT.validation.params, [paramName, method, typeof params, 'string']))

  if (!params) throw new TypeError(makeString(TEXT.validation.empty, [paramName, method]))
}
