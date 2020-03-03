import Service, { DebugLevels, Responses, Event } from '../src'
import { TEXT, validBitcoinAddresses, listOfStatusKeys, typeOfStatusValues } from '../src/data'
import { makeStringFromTemplate } from '../src/tools'
import { validateObject } from '../src/validators'
import { ObjectWithStringKeysAnyValues } from '../src/types'
import { ENV } from '../src/env'

let storedEvent: Event | {}

function eventBus(event: Event) {
  storedEvent = event
}

let service: Service;

async function setAsync() {
  service = await new Service({
    debug: DebugLevels.MUTE,
    eventBus,
    respondAs: Responses.Callback,
    authDetails: { ...ENV.auth },
  })
  return await service.getStatus()
}

process.on('unhandledRejection', () => {})

describe('Smaller functions', () => {
  beforeAll(async () => {
    try {
      service = await new Service({ debug: DebugLevels.MUTE, authDetails: { ...ENV.auth } })
      await service.getStatus()
    } catch (e) {}
  })
  beforeEach(() => {
    storedEvent = {}
  })
  describe('- getStatus', () => {
    test('- returns information in \'Direct\' mode', async () => {
      // await setDirect()

      const result = await service.getStatus()

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
    test('- returns information in \'Callback\' mode', async () => {
      expect.assertions(2)
      await setAsync()
      await service.getStatus()

      const eventReceived = storedEvent as Event

      expect(eventReceived.type).toBe('service_update_status')

      const result: ObjectWithStringKeysAnyValues = eventReceived.payload

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
    test('- doesn\'t cache address in case of incorrect request', async () => {
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
