/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import Service, { DebugLevels, AuthDetails, SwitchActions } from '../src'
import { TEXT, validBitcoinAddresses } from '../src/data'
import { wait } from './tools'

dotenv.config()

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

process.on('unhandledRejection', () => {
  return
})

describe('Send', () => {
  let service: Service
  beforeAll(async () => {
    try {
      service = new Service({ debug: DebugLevels.MUTE, authDetails })
      await service.getStatus()
    } catch (e) {
      return
    }
  })
  afterAll(async () => {
    service.connect({ action: SwitchActions.CONNECT, value: false })
    await wait(2000)
  })
  describe('empty/incorrect argument validation:', () => {
    it('throws Error on missing argument', async () => {
      try {
        // @ts-ignore
        await service.send()
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Data is missing')
      }
    })
    it('throws TypeError on array as argument', async () => {
      try {
        // @ts-ignore
        await service.send([])
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Transaction can\'t be array. It should be object {}.')
      }
    })
    it('- throws TypeError on function as argument', async () => {
      try {
        // @ts-ignore
        await service.send(() => {
          return
        })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Argument can\'t be a function.')
      }
    })
    it('- throws TypeError non-object argument', async () => {
      try {
        // @ts-ignore
        await service.send(1234)
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Wrong type of argument')
      }
    })
    it('- throws Error on empty object', async () => {
      try {
        // @ts-ignore
        await service.send({})
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Data is malformed. Missing values: to, amount, collect, deposit.')
      }
    })
  })
  describe('- key/value validation', () => {
    it('- doesn\'t validate values if at least one missing key or key with empty value', async () => {
      try {
        // @ts-ignore
        await service.send({ to: 123, amount: 123, collect: 123, deposit: '' })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Data is malformed. Missing values: deposit.')
      }
    })
    it('- except for amount, everything else should be \'string\', \'to\' - must be valid address', async () => {
      try {
        // @ts-ignore
        await service.send({ to: 123, amount: 123, collect: 123, deposit: 'qwerty' })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Data is malformed. Malformed values: to, collect.')
      }
    })
    it('- optional values are also tested for being \'string\'', async () => {
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
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty(
          'message',
          'Data is malformed. Malformed values: to, deposit, amount, from, hint, id.',
        )
      }
    })
    it('valid address in \'to\' passes validation', async () => {
      try {
        // @ts-ignore
        await service.send({ to: validBitcoinAddresses[2], amount: 123, collect: 'qwerty', deposit: 'qwerty' })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadRequest')
        expect(err).toHaveProperty('message', '\'collect\' is not a valid BTC transaction.')
      }
    })
  })
})
