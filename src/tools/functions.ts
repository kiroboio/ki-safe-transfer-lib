import { pipe } from 'ramda'


function tryCatch<T, K = T, V = unknown>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (arg0: any) => T,
  param: K,
  options?: { returnParam?: boolean; returnValue?: V },
): T | K | V | void {
  try {
    return pipe(fn)(param)
  } catch (err) {
    if (options?.returnParam) return param

    if (options?.returnValue) return options.returnValue
  }

  return
}

export { tryCatch }
