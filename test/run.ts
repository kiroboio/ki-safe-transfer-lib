import Service, { DebugLevels, Currencies, Networks } from '../src/'

// TODO: remove
// test('', () => {
//   console.log(new Service({}))
// })

const defaultSettings = {
  version: 'v1',
  debug: DebugLevels.MUTE,
  currency: Currencies.Bitcoin,
  network: Networks.Testnet,
}

const customSettings = { ...defaultSettings, debug: DebugLevels.QUIET }

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


const service = new Service({})

console.log(service.getSettings())

console.log(service)

service.getRetrievable('6a7acf1cdd7d35f3d86aa005c09cd27ac71bc1fc0c71454f3d9938fb88250edd0000')
