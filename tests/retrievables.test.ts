/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Service, DebugLevels, Responses, Event } from '../src'
import { TEXT } from '../src/data'
import { ENV } from '../src/env'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function eventBus(event: Event): void {
  return
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function callbackService() {
  const service = new Service({ eventBus, respondAs: Responses.Callback, authDetails: { ...ENV.auth } })

  await service.getStatus()
  return service
}

process.on('unhandledRejection', () => {
  return
})

describe('Retrievables', () => {
  let service: Service
  beforeAll(async () => {
    try {
      service = new Service({ debug: DebugLevels.MUTE, authDetails: { ...ENV.auth } })
      await service.getStatus()
    } catch (e) {
      return
    }
  })
  describe('- empty/incorrect argument validation', () => {
    test('- throws Error on missing argument', async () => {
      try {
        // @ts-ignore
        await service.getRetrievable()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toHaveProperty('message', TEXT.errors.validation.missingArgument)
      }
    })
    test('- throws TypeError argument with wrong type', async () => {
      try {
        // @ts-ignore
        await service.getRetrievable(1234)
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
    test('- argument with wrong types', async () => {
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
    const id = 'xxxxxxxxxx'

    try {
      await service.getRetrievable(id)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty('message', `No record found for id '${id}'`)
    }
  })
  test('get "not found" error even if in "Callback mode"', async () => {
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
