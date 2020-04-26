/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import { Service, DebugLevels, Responses, Event, AuthDetails, SwitchActions } from '../src'
import { TEXT } from '../src/data'

dotenv.config()

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

const ids = ['xxxxxxxxxx', 'xxxxxxxxx']

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function eventBus(event: Event): void {
  return
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function callbackService() {
  const service = new Service({ eventBus, respondAs: Responses.Callback, authDetails })

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
      service = new Service({ debug: DebugLevels.MUTE, authDetails })
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
        await service.getRetrievables()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toHaveProperty('message', TEXT.errors.validation.missingArgument)
      }
    })
    test('- throws TypeError argument with wrong type', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getRetrievables(1234)
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
        await service.getRetrievables([1, (): void => {}, {}])
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
  })
  // test('get "not found" error in case of correct request', async () => {
  //   expect.assertions(2)

  //   try {
  //     console.log(await service.getRetrievables(ids))
  //   } catch (error) {
  //    console.log(error)
  //     expect(error).toBeInstanceOf(Error)
  //     expect(error).toHaveProperty('message', `No record found for id '${ids}'`)
  //   }
  // })
  // test('get "not found" error even if in "Callback mode"', async () => {
  //   expect.assertions(2)

  //   try {
  //     const newService = await callbackService()

  //     await newService.getRetrievables(ids)
  //   } catch (error) {
  //     expect(error).toBeInstanceOf(Error)
  //     expect(error).toHaveProperty('message', `No record found for id '${ids}'`)
  //   }
  // })
})
