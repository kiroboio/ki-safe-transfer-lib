import { is } from '../src/mode'
import { Logger } from '../src/logger'
import { DebugLevels } from '../src'


const Log = new Logger({debug: DebugLevels.QUIET})

describe('Mode', () => {
  it('- should return false on \'development\'', () => {
    try {
      expect(is('dev')).toBe(false)
    } catch (err) { Log.error(err.message) }
  })
  it('- should return false on \'production\'', () => {
   try {
     expect(is('prod')).toBe(false)
   } catch (err) {
     Log.error(err.message)
   }
  })
  it('- should return true on \'test\'', () => {
    try {
      expect(is('test')).toBe(true)
    } catch (err) {
      Log.error(err.message)
    }
  })
})