import Service, { DebugLevels, Responses, Event } from '../src'
import { TEXT, validBitcoinAddresses } from '../src/data'
import { makeStringFromTemplate } from '../src/tools'
import { ENV } from '../src/env'

let storedEvent: Event

function eventBus(event: Event) {
  storedEvent = event
}


process.on('unhandledRejection', () => {})

describe('Send', () => {
  let service: Service;
   beforeAll(async () => {
     try {
       service = await new Service({ debug: DebugLevels.MUTE, authDetails: { ...ENV.auth } })
       await service.getStatus()
     } catch (e) {}
   })
  describe('- empty/incorrect argument validation', () => {
    test('- throws Error on missing argument', async () => {
      try {
        // @ts-ignore
        await service.send()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toHaveProperty('message', TEXT.errors.validation.missingArgument)
      }
    })
    test('- throws TypeError argument with wrong type', async () => {
      try {
        // @ts-ignore
        await service.send(1234)
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
    test('- throws TypeError argument with empty object', async () => {
      try {
        // @ts-ignore
        await service.send({})
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty(
          'message',
          `${TEXT.errors.validation.malformedData} ${TEXT.errors.validation.missingValues}to, amount, collect, deposit.`,
        )
      }
    })
  })
})
