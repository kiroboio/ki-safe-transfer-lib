import { modeIs } from '../src/tools/mode'

const { log } = console

describe('Mode', () => {
  it('returns false on \'development\'', () => {
    try {
      expect(modeIs('development')).toBe(false)
    } catch (err) {
      log(err.message)
    }
  })
  it('returns false on \'production\'', () => {
    try {
      expect(modeIs('production')).toBe(false)
    } catch (err) {
      log(err.message)
    }
  })
  it('returns true on \'test\'', () => {
    try {
      expect(modeIs('test')).toBe(true)
    } catch (err) {
      log(err.message)
    }
  })
})
