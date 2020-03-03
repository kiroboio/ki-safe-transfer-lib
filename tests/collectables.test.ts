import Service, { DebugLevels, Responses, Event, SwitchActions } from '../src'
import { TEXT, validBitcoinAddresses } from '../src/data'
import { makeStringFromTemplate } from '../src/tools'
import { ENV } from '../src/env'

let storedEvent: Event[] = []

function eventBus(event: Event) {
  storedEvent.push(event)
}

process.on('unhandledRejection', () => {})

describe('Collectables', () => {
  let service: Service
   beforeAll(async () => {
     try {
       service = await new Service({ authDetails: { ...ENV.auth } })
       await service.getStatus()
     } catch (e) {}
   })
  afterAll(() => {
    service.connect({ action: SwitchActions.CONNECT, value: false })
  })
  describe('- empty/incorrect argument validation', () => {
    test('- throws Error on missing argument', async () => {
      try {
        // @ts-ignore
        await service.getCollectables()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toHaveProperty('message', TEXT.errors.validation.missingArgument)
      }
    })
    test('- throws TypeError argument with wrong type', async () => {
      try {
        // @ts-ignore
        await service.getCollectables(1234)
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
    test('- argument with wrong types', async () => {
      try {
        // @ts-ignore
        await service.getCollectables([1, () => {}, {}])
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
    test('- address, that belongs to different network throws error', async () => {
      try {
        await service.getCollectables([validBitcoinAddresses[1]])
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toHaveProperty(
          'message',
          makeStringFromTemplate(TEXT.errors.validation.malformedAddress, [validBitcoinAddresses[1]]),
        )
      }
    })
  })
  test('get an array as a result of proper request', async () => {
    const result = await service.getCollectables([validBitcoinAddresses[2]])

    expect(Array.isArray(result)).toBe(true)
  })
  test('get an array through eventBus, if used', async () => {
    expect.assertions(3)

    service = new Service({ eventBus, respondAs: Responses.Callback, authDetails: {...ENV.auth} })

    await service.getStatus()

    const result = await service.getCollectables([validBitcoinAddresses[2]])

    expect(result).toBe(undefined)

    const event = storedEvent.filter(el => el.type === 'service_get_collectables')

    expect(event.length).toBe(1)
    expect(Array.isArray(event[0].payload)).toBe(true)
  })
})
