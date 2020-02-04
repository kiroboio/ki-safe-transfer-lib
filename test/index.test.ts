import Service, { DebugLevels, Currencies, Networks } from '../src/'

// TODO: remove
test('', () => {
  console.log(new Service({}))
})

const defaultSettings = { version: 'v1', debug: DebugLevels.MUTE, currency: Currencies.Bitcoin, network: Networks.Testnet }

const customSettings = {...defaultSettings, debug:DebugLevels.QUIET}

// TODO: extract
 const compareObjects = (object1: any, object2: any) => {
   if (Object.keys(object1).length !== Object.keys(object2).length) return false
   let result = true
   Object.keys(object1).forEach(key => {
     if (object1[key] !== object2[key]) {
       result = false
     }
   })
   return result
 }

describe('Settings:', () => {
test('- default settings are available and correct', () => {
  const testClass = new Service({})
  const settings = testClass.getSettings()
  expect(compareObjects(settings, defaultSettings)).toEqual(true)
})
test('- custom settings are set correctly', () => {
  const testClass = new Service(customSettings)
  const settings = testClass.getSettings()
  expect(compareObjects(settings, customSettings)).toEqual(true)
})
})
