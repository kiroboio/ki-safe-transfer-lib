/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import { Service, DebugLevels, Responses, Event, AuthDetails, SwitchActions } from '../src'
import { TEXT } from '../src/data'

dotenv.config()

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function eventBus(event: Event): void { return; }

async function callbackService(): Promise<Service> {
  const service = new Service({ eventBus, respondAs: Responses.Callback, authDetails })

  await service.getStatus()
  return service
}

process.on('unhandledRejection', () => {
  return
})

describe('Retrievable', () => {
  let service: Service
  beforeAll(async () => {
    try {
      service = new Service({ debug: DebugLevels.MUTE, eventBus, authDetails })
      await service.getStatus()
    } catch (e) {
      return
    }
  })

  afterAll(() => {
    service.connect({ action: SwitchActions.CONNECT, value: false })
  })
  describe('- empty/incorrect argument validation', () => {
    test('- throws Error on missing argument', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getRetrievable()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toHaveProperty('message', TEXT.errors.validation.missingArgument)
      }
    })
    test('- throws TypeError argument with wrong type', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getRetrievable(1234)
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
    test('- argument with wrong types', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        await service.getRetrievable([1, (): void => {}, {}])
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
  })
  test('get "not found" error in case of correct request', async () => {
    expect.assertions(2)

    const id = 'xxxxxxxxxx'

    try {
      await service.getRetrievable(id)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty('message', `No record found for id '${id}'`)
    }
  })
  test('get "not found" error even if in "Callback mode"', async () => {
    expect.assertions(2)

    const id = 'xxxxxxxxxx'

    try {
      const newService = await callbackService()

      await newService.getRetrievable(id)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty('message', `No record found for id '${id}'`)
    }
  })
})
