/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import Service, { DebugLevels, Currencies, Networks, Responses, Event, AuthDetails } from '../src'
import { TEXT, valuesForSettings } from '../src/data'
import { makeStringFromTemplate, compareBasicObjects } from '../src/tools'

dotenv.config()

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function eventBus(event: Event): void {
  return
}

process.on('unhandledRejection', () => {
  return
})

describe('Library configuration', () => {
  test('service runs without settings', async () => {
    new Service({ authDetails })
  })
  describe('- incorrect settings', () => {
    test('- null not considered as settings', async () => {
      try {
        // @ts-ignore
        new Service(null)
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', `${TEXT.errors.validation.missingArgument}: authDetails.`)
      }
    })
    test('- no string', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        new Service('string')
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
    test('- no multiple parameters', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        new Service('string', 'string')
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
    test('- no functions', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        new Service(() => {
          return
        })
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.noFunction)
      }
    })
    test('- no numbers', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        new Service(7)
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
    test('- no booleans', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        new Service(true)
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
    test('- no empty object', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        new Service({})
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.emptyObject)
      }
    })

    test('- no extra keys', async () => {
      expect.assertions(2)

      try {
        new Service({
          // @ts-ignore
          key1: '1',
          key2: '1',
          key3: '1',
          key4: '1',
          key5: '1',
          key6: '1',
        })
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', `${TEXT.errors.validation.unknownKeys}key1.`)
      }
    })
    test('- no unknown keys', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        new Service({ key1: '1' })
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', `${TEXT.errors.validation.unknownKeys}key1.`)
      }
    })
    test('- wrong value type', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        new Service({ debug: '1' })
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty(
          'message',
          makeStringFromTemplate(TEXT.errors.validation.wrongValueType, ['debug', 'number']),
        )
      }
    })
    test('- wrong value', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        new Service({ debug: 5 })
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)

        const list = valuesForSettings.debug as string[]

        expect(error).toHaveProperty(
          'message',
          makeStringFromTemplate(TEXT.errors.validation.wrongValue, ['5', 'debug', list.join(', ')]),
        )
      }
    })
  })
  describe('- correct settings', () => {
    test('- correct value provided & retrieved', async () => {
      const settings = {
        debug: DebugLevels.VERBOSE,
        currency: Currencies.Bitcoin,
        network: Networks.Testnet,
        respondAs: Responses.Direct,
      }

      const service = new Service({ ...settings, authDetails })

      const result = service.getSettings()

      const compare = compareBasicObjects(result, { ...settings, version: 'v1' })

      expect(compare).toBe(true)
    })
  })
})
