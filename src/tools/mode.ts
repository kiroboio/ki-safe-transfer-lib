export function modeIs(mode: 'test' | 'development' | 'production'): boolean {
  return process.env.NODE_ENV === mode;
}
