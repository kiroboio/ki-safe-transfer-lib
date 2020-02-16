import Service, { DebugLevels, Responses, Event } from '../src'
import { TEXT, validBitcoinAddresses, listOfStatusKeys, typeOfStatusValues } from '../src/data'
import { makeStringFromTemplate } from '../src/tools'
import { validateObject } from '../src/validators'
import { ObjectWithStringKeysAnyValues } from '../src/types'

let storedEvent: Event

function eventBus(event: Event) {
  storedEvent = event
}

const service = new Service({ debug: DebugLevels.MUTE, eventBus, respondAs: Responses.Callback })
const serviceDirect = new Service({ debug: DebugLevels.MUTE })

process.on('unhandledRejection', () => {})

describe('Smaller functions', () => {
  describe('- getStatus', () => {
    test("- returns information in 'Direct' mode", async () => {
      const result = await serviceDirect.getStatus()
      let keysValuesCheck = true
      try {
        validateObject(result)
      } catch (e) {
        keysValuesCheck = false
      }
      Object.keys(result).forEach(key => {
        if (!listOfStatusKeys.includes(key)) keysValuesCheck = false
        const resValType = typeof result[key]
        const reqValType = typeOfStatusValues[key]
        if (resValType !== reqValType) keysValuesCheck = false
      })

      expect(keysValuesCheck).toBe(true)
    })
    test("- returns information in 'Callback' mode", async () => {
      expect.assertions(2)
      await service.getStatus()
      expect(storedEvent.type).toBe('service_update_status')
      const result: ObjectWithStringKeysAnyValues = storedEvent.payload
      let keysValuesCheck = true
      try {
        validateObject(result)
      } catch (e) {
        keysValuesCheck = false
      }
      Object.keys(result).forEach(key => {
        if (!listOfStatusKeys.includes(key)) keysValuesCheck = false
        const resValType = typeof result[key]
        const reqValType = typeOfStatusValues[key]
        if (resValType !== reqValType) keysValuesCheck = false
      })

      expect(keysValuesCheck).toBe(true)
    })
  })
  describe('- cached addresses functions', () => {
    test("- doesn't cache address in case of incorrect request", async () => {
      await service.getCollectables([validBitcoinAddresses[1]])
      const result = service.getLastAddresses()
      expect(result.length).toBe(0)
    })

    test('- caches address in case of correct request', async () => {
      await service.getCollectables([validBitcoinAddresses[2]])
      const result = service.getLastAddresses()[0]
      expect(result).toBe(validBitcoinAddresses[2])
    })
    test('- clears cache', async () => {
      expect.assertions(2)
      await service.getCollectables([validBitcoinAddresses[2]])
      const result = service.getLastAddresses()[0]
      expect(result).toBe(validBitcoinAddresses[2])
      service.clearLastAddresses()
      const clear = service.getLastAddresses()
      expect(clear.length).toBe(0)
    })
  })
})
