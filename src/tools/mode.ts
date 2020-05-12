export function is(mode: 'test' | 'dev' | 'prod'): boolean {
  if (mode === 'test' && process.env.NODE_ENV === 'test') return true

  if (mode === 'dev' && process.env.NODE_ENV === 'development') return true

  if (mode === 'prod' && process.env.NODE_ENV === 'production') return true

return false

}