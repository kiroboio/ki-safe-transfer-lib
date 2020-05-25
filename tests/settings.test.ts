/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'
import { is } from 'ramda'

import Service, { DebugLevels, Currencies, Networks, Responses, AuthDetails } from '../src'
import { TEXT, valuesForSettings } from '../src/data'
import { makeString, compareBasicObjects } from '../src/tools'
import { wait } from './tools'

dotenv.config()

const { log } = console

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

process.on('unhandledRejection', () => {
  return
})

let service: Service

describe('Library configuration', () => {
  afterAll(async () => {
    if (service) {
      service.disconnect()
      await wait(2000)
    }
  })
  describe('incorrect settings:', () => {
    it('doesn\'t take null as settings', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        service = Service.getInstance(null, true)
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', 'Data is missing: authDetails.')
      }
    })
    it('doesn\'t take wrong type of params', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        service = Service.getInstance('string', true)
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
    it('doesn\'t take multiple parameters', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        Service.getInstance('string', 'string')
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })

    it('doesn\'t take empty object', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        service = Service.getInstance({})
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.emptyObject)
      }
    })
    it('doesn\'t take settings with extra keys', async () => {
      expect.assertions(2)

      try {
        Service.getInstance({
          // @ts-ignore
          key1: '1',
          key2: '1',
          key3: '1',
          key4: '1',
          key5: '1',
          key6: '1',
        },
        true)
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', `${TEXT.errors.validation.unknownKeys}key1.`)
      }
    })
    it('doesn\'t take settings with unknown keys', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        Service.getInstance({ key1: '1' }, true)
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', `${TEXT.errors.validation.unknownKeys}key1.`)
      }
    })
    it('doesn\'t take settings with wrong value type', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        Service.getInstance({ debug: '1' })
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', makeString(TEXT.errors.validation.wrongValueType, ['debug', 'number']))
      }
    })
    it('doesn\'t take settings with wrong values', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        Service.getInstance({ debug: 5 })
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)

        const list = valuesForSettings.debug as string[]

        expect(error).toHaveProperty(
          'message',
          makeString(TEXT.errors.validation.wrongValue, ['5', 'debug', list.join(', ')]),
        )
      }
    })
  })
  describe('correct settings:', () => {
    it('runs without settings (auth is always required)', async () => {
      try {
        service = Service.getInstance({ authDetails })
        expect(is(Object, service)).toBe(true)
      } catch (err) {
        log(err)
      }
    })
    it('doesn\'t throw if provided correct settings', async () => {
      const settings = {
        debug: DebugLevels.VERBOSE,
        currency: Currencies.Bitcoin,
        network: Networks.Testnet,
        respondAs: Responses.Direct,
      }

      try {
        service = Service.getInstance({ ...settings, authDetails })

        const compare = compareBasicObjects(service.getSettings(), { ...settings, version: 'v1' })

        expect(compare).toBe(true)
      } catch (err) {
        log(err)
      }
    })
  })
})
