import Service, { DebugLevels, Currencies, Networks, Responses, Event } from '../src'
import { TEXT, valuesForSettings, validBitcoinAddresses } from '../src/data'
import { makeStringFromTemplate, compareBasicObjects } from '../src/tools'

let storedEvent: {}

function eventBus(event: Event) {
  console.log(event)
  storedEvent = event
}

const service = new Service({ debug: DebugLevels.MUTE })

process.on('unhandledRejection', () => {})

describe('Retrievables', () => {
  beforeEach(() => {
    storedEvent = {}
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
        await service.getRetrievable([1, () => {}, {}])
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
  })
  test("get 'not found' error in case of correct request", async () => {
    const id = 'xxxxxxxxxx'
    try {
      await service.getRetrievable(id)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty('message', `No record found for id '${id}'`)
    }
  })
  test("get 'not found' error even if in 'Callback mode'", async () => {
    const id = 'xxxxxxxxxx'
    try {
      const newService = new Service({ eventBus, respondAs: Responses.Callback })
      await newService.getRetrievable(id)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty('message', `No record found for id '${id}'`)
    }
  })
})
