/* eslint-disable @typescript-eslint/ban-ts-comment */

import dotenv from 'dotenv'
import { is } from 'ramda'

import Service, { DebugLevels, Currencies, Networks, Responses, AuthDetails } from '../src/.'
import { TEXT, valuesForSettings } from '../src/data'
import { makeString, checkSettings } from '../src/tools'
import { wait } from './tools'

dotenv.config()

const { log } = console

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

process.on('unhandledRejection', () => {
  return
})

let service: Service

describe('Library configuration', () => {
  describe('incorrect settings:', () => {
    it('doesn\'t take null as settings', async () => {
      expect.assertions(2)

      try {
        // @ts-expect-error
        service = Service.createInstance(null)
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', 'Data is missing: authDetails.')
      }
    })
    it('doesn\'t take wrong type of params', async () => {
      expect.assertions(2)

      try {
        // @ts-expect-error
        service = Service.createInstance('string')
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
    it('doesn\'t take multiple parameters', async () => {
      expect.assertions(2)

      try {
        // @ts-expect-error
        Service.createInstance('string', 'string')
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })

    it('doesn\'t take empty object', async () => {
      expect.assertions(2)

      try {
        // @ts-expect-error
        service = Service.createInstance({})
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.emptyObject)
      }
    })
    it('doesn\'t take settings with extra keys', async () => {
      expect.assertions(2)

      try {
        Service.createInstance({
          // @ts-expect-error
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
        // @ts-expect-error
        Service.createInstance({ key1: '1' })
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', `${TEXT.errors.validation.unknownKeys}key1.`)
      }
    })
    it('doesn\'t take settings with wrong value type', async () => {
      expect.assertions(2)

      try {
        // @ts-expect-error
        Service.createInstance({ debug: '1' })
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', makeString(TEXT.errors.validation.wrongValueType, ['debug', 'number']))
      }
    })
    it('doesn\'t take settings with wrong values', async () => {
      expect.assertions(2)

      try {
        // @ts-expect-error
        Service.createInstance({ debug: 5 })
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
        service = Service.createInstance({ authDetails })
        expect(is(Object, service)).toBe(true)
      } catch (err) {
        log(err)
      }
    })
    it('doesn\'t throw if provided correct settings', async () => {
      expect.assertions(1)

      const settings = {
        debug: DebugLevels.VERBOSE,
        currency: Currencies.Bitcoin,
        network: Networks.Testnet,
        respondAs: Responses.Direct,
        authDetails: {key:'',secret:''},
        eventBus: () => { log },
      }

      try {
        service = Service.createInstance({ ...settings, authDetails })

        const compare = checkSettings(service.getSettings())

        expect(compare).toBe(true)
      } catch (err) {
        log(err)
      }
    })
  })
})
