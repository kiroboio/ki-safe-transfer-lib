import dotenv from 'dotenv'

import Service, { DebugLevels, Responses, Event, Status, AuthDetails } from '../src/.'
import { listOfStatusKeys, typeOfStatusValues } from '../src/data'

import { changeType } from '../src/tools/other'
import { validateObject } from '../src/validators'
import { wait } from './tools'
import { validBitcoinAddresses } from './test_data'

dotenv.config()

const { log } = console

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

let storedEvent: Event | Record<string, unknown>

function eventBus(event: Event): void {
  storedEvent = event
}

let service: Service

async function setAsync(): Promise<Status | void> {
  try {
    service = Service.getInstance(
      {
        debug: DebugLevels.MUTE,
        eventBus,
        respondAs: Responses.Callback,
        authDetails,
      },
      true,
    )
    await wait(10000)
    return await service.getStatus()
  } catch (err) {
    log(err)
  }
}

process.on('unhandledRejection', () => {
  return
})

describe('Smaller functions', () => {
  beforeAll(async () => {
    try {
      service = Service.getInstance({ debug: DebugLevels.MUTE, authDetails })
      await service.getStatus()
    } catch (e) {
      return
    }
  })
  beforeEach(() => {
    storedEvent = {}
  })

  
  describe(' getStatus:', () => {
    it('returns information in "Direct" mode', async () => {
      const result = await service.getStatus({ respondDirect: true })

      let keysValuesCheck = true

      try {
        validateObject(result)
      } catch (e) {
        keysValuesCheck = false
      }

      if (result) {
        Object.keys(result).forEach(key => {
          if (!listOfStatusKeys.includes(key)) keysValuesCheck = false
          else {
            const resValType = typeof changeType<Record<string, string | number | boolean>>(result)[key]

            const reqValType = typeOfStatusValues[key]

            if (resValType !== reqValType) keysValuesCheck = false
          }
        })
      }

      expect(keysValuesCheck).toBe(true)
    })
    it('returns information in "Callback" mode', async () => {
      expect.assertions(2)
      await setAsync()
      await service.getStatus()

      const eventReceived = storedEvent as Event

      expect(eventReceived.type).toBe('service_update_status')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = changeType<Record<string, any>>(eventReceived.payload)

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
  describe('cached addresses functions', () => {
    // eslint-disable-next-line @typescript-eslint/quotes
    it(`doesn't cache address in case of incorrect request`, async () => {
      expect.assertions(2)

      try {
        await service.getCollectables([validBitcoinAddresses[1]])

        service.getLastAddresses()
      } catch (error) {
        expect(error).toBeInstanceOf(Object)
        expect(error).toHaveProperty('name', 'BadProps')
      }
    })

    it('caches address in case of correct request', async () => {
      await service.getCollectables([validBitcoinAddresses[2]])

      const result = service.getLastAddresses()

      expect(result.addresses[0]).toBe(validBitcoinAddresses[2])
    })
    it('clears cache', async () => {
      expect.assertions(2)
      await service.getCollectables([validBitcoinAddresses[2]])

      const result = service.getLastAddresses()

      expect(result.addresses[0]).toBe(validBitcoinAddresses[2])
      service.clearLastAddresses()

      const clear = service.getLastAddresses()

      expect(clear.addresses.length).toBe(0)
    })
  })
})
