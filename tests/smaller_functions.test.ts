import dotenv from 'dotenv'

import Service, { DebugLevels, Responses, Event } from '../src'
import { validBitcoinAddresses, listOfStatusKeys, typeOfStatusValues } from '../src/data'
import { validateObject } from '../src/validators'
import { ObjectWithStringKeysAnyValues, Status, AuthDetails, ObjectWithStringKeys, SwitchActions } from '../src/types'
import { changeType } from '../src/tools'

dotenv.config()

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

let storedEvent: Event | {}

function eventBus(event: Event): void {
  storedEvent = event
}

let service: Service

async function setAsync(): Promise<Status | void> {
  service = new Service({
    debug: DebugLevels.MUTE,
    eventBus,
    respondAs: Responses.Callback,
    authDetails,
  })
  return await service.getStatus()
}

process.on('unhandledRejection', () => {
  return
})

describe('Smaller functions', () => {
  beforeAll(async () => {
    try {
      service = new Service({ debug: DebugLevels.MUTE, authDetails })
      await service.getStatus()
    } catch (e) {
      return
    }
  })
  beforeEach(() => {
    storedEvent = {}
  })

  afterAll(() => {
    service.connect({ action: SwitchActions.CONNECT, value: false })
  })
  describe('- getStatus', () => {
    test('- returns information in "Direct" mode', async () => {
      // await setDirect()

      const result = await service.getStatus()

      let keysValuesCheck = true

      try {
        validateObject(result)
      } catch (e) {
        keysValuesCheck = false
      }

      if (result) {
        Object.keys(result).forEach(key => {
          if (!listOfStatusKeys.includes(key)) keysValuesCheck = false

          const resValType = typeof changeType<ObjectWithStringKeys>(result)[key]

          const reqValType = typeOfStatusValues[key]

          if (resValType !== reqValType) keysValuesCheck = false
        })
      }

      expect(keysValuesCheck).toBe(true)
    })
    test('- returns information in "Callback" mode', async () => {
      expect.assertions(2)
      await setAsync()
      await service.getStatus()

      const eventReceived = storedEvent as Event

      expect(eventReceived.type).toBe('service_update_status')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = changeType<ObjectWithStringKeysAnyValues<any>>(eventReceived.payload)

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
    // eslint-disable-next-line @typescript-eslint/quotes
    test(`- doesn't cache address in case of incorrect request`, async () => {
      expect.assertions(2)

      try {
        await service.getCollectables([validBitcoinAddresses[1]])

        service.getLastAddresses()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toHaveProperty('message', `Malformed address: ${validBitcoinAddresses[1]}.`)
      }
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
