import Service, { DebugLevels, Currencies, Networks, Responses, Event, Sendable } from '../src'
import { TEXT, validBitcoinAddresses } from '../src/data'

let storedEvent: {}

function eventBus(event: Event) {
  console.log(event)
  storedEvent = event
}

const service = new Service({ debug: DebugLevels.MUTE })

process.on('unhandledRejection', () => {})

describe('Send', () => {
  beforeEach(() => {
    storedEvent = {}
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
    test('- throws TypeError on array as argument', async () => {
      try {
        // @ts-ignore
        await service.send([])
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.noArray)
      }
    })
    test('- throws TypeError on function as argument', async () => {
      try {
        // @ts-ignore
        await service.send(() => {})
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.noFunction)
      }
    })
    test('- throws TypeError non-object argument', async () => {
      try {
        // @ts-ignore
        await service.send(1234)
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
    test('- throws Error on empty object', async () => {
      try {
        // @ts-ignore
        await service.send({})
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toHaveProperty(
          'message',
          `${TEXT.errors.validation.malformedData} ${TEXT.errors.validation.missingValues}to, amount, collect, deposit.`,
        )
      }
    })
  })
  describe('- key/value validation', () => {
    test("- doesn't validate values if at least one missing key or key with empty value", async () => {
      try {
        // @ts-ignore
        await service.send({ to: 123, amount: 123, collect: 123, deposit: '' })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toHaveProperty(
          'message',
          `${TEXT.errors.validation.malformedData} ${TEXT.errors.validation.missingValues}deposit.`,
        )
      }
    })
    test("- except for amount, everything else should be 'string', 'to' - must be valid address", async () => {
      try {
        // @ts-ignore
        await service.send({ to: 123, amount: 123, collect: 123, deposit: 'qwerty' })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toHaveProperty(
          'message',
          `${TEXT.errors.validation.malformedData} ${TEXT.errors.validation.malformedValues}to, collect.`,
        )
      }
    })
    test("- optional values are also tested for being 'string'", async () => {
      try {
        // @ts-ignore
        await service.send({
          to: 'qwerty',
          // @ts-ignore
          amount: '123',
          collect: 'qwerty',
          // @ts-ignore
          deposit: 123,
          // @ts-ignore
          id: 1,
          // @ts-ignore
          from: 2,
          // @ts-ignore
          hint: 3,
        })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toHaveProperty(
          'message',
          `${TEXT.errors.validation.malformedData} ${TEXT.errors.validation.malformedValues}to, deposit, amount, from, hint, id.`,
        )
      }
    })
    test("- valid address in 'to' passes validation", async () => {
      try {
        // @ts-ignore
        await service.send({ to: validBitcoinAddresses[2], amount: 123, collect: 'qwerty', deposit: 'qwerty' })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toHaveProperty(
          'message',
          `{\"code\":400,\"message\":\"'collect' is not a valid BTC transaction.\",\"errors\":[{}]}`,
        )
      }
    })
  })
})
