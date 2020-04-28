export function validateArray (arr: unknown[], type: string[]): boolean {
  if (!Array.isArray(arr)) return false

  let result = true

  arr.forEach(el => {
    if (!type.includes(typeof el)) result = false
  })

  return result
}
