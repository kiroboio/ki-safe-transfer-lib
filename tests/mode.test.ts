import { is } from '../src/mode'

describe('Mode', () => {
  it('- should return false on \'development\'', () => {
    expect(is('dev')).toBe(false)
  })
  it('- should return false on \'production\'', () => {
    expect(is('prod')).toBe(false)
  })
  it('- should return true on \'test\'', () => {
    expect(is('test')).toBe(true)
  })
})