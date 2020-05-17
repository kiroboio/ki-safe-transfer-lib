/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import Service, { DebugLevels, AuthDetails } from '../src'
import { wait } from './tools'
import { validBitcoinAddresses } from './test_data'

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
    service.disconnect()
    await wait(2000)
  })
  describe('empty/incorrect argument object validation:', () => {
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
        expect(err).toHaveProperty('message', "Transaction can't be array. It should be object {}.")
      }
    })
    it('throws TypeError on function as argument', async () => {
      try {
        // @ts-ignore
        await service.send(() => {
          return
        })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', "Argument can't be a function.")
      }
    })
    it('throws TypeError non-object argument', async () => {
      try {
        // @ts-ignore
        await service.send(1234)
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Wrong type of argument')
      }
    })
    it('throws Error on empty object', async () => {
      try {
        // @ts-ignore
        await service.send({})
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Data is malformed. Missing values: to, amount, collect, deposit, owner.')
      }
    })
    it('throws Error on empty object', async () => {
      try {
        // @ts-ignore
        await service.send({})
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Data is malformed. Missing values: to, amount, collect, deposit, owner.')
      }
    })
  })
  describe('argument key/value validation:', () => {
    it('throws if at least one missing required key or key with empty value', async () => {
      try {
        // @ts-ignore
        await service.send({ to: 123, amount: 123, collect: 123, deposit: '' })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Data is malformed. Missing values: deposit, owner.')
      }
    })
    it('throws if at there is wrong key', async () => {
      try {
        // @ts-ignore
        await service.send({ to: 123, amount: 123, collect: 123, deposit: '', ownerId: 'string' })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Data is malformed. Missing values: deposit, owner.')
      }
    })
    it("throws if except for amount, everything else is not a 'string', 'to' - must be valid address", async () => {
      try {
        // @ts-ignore
        await service.send({ to: 123, amount: 123, collect: 123, deposit: 'qwerty', owner: 123 })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Data is malformed. Malformed values: to, collect, owner.')
      }
    })
    it('throws if optional values are not of right type', async () => {
      try {
        // @ts-ignore
        await service.send({
          to: 'qwerty',
          // @ts-ignore
          amount: '123',
          collect: 'qwerty',
          owner: 'string',
          // @ts-ignore
          depositPath: 123,
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
          'Data is malformed. Malformed values: to, deposit, amount, from, hint, id, depositPath.',
        )
      }
    })
    it('throws if "owner" length is shorter than 20 symbols', async () => {
      expect.assertions(4)

      try {
        await service.send({
          to: validBitcoinAddresses[2],
          amount: 123,
          collect: 'qwerty',
          deposit: 'qwerty',
          owner: '12345678',
          depositPath: 'qwerty',
        })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadRequest')
        expect(err).toHaveProperty('message', 'Data does not match schema')
        expect(err).toHaveProperty('errors', ["'owner' should NOT be shorter than 20 characters"])
      }
    })
    it('throws if "owner" length is longer than 120 symbols', async () => {
      expect.assertions(4)

      try {
        await service.send({
          to: validBitcoinAddresses[2],
          amount: 123,
          collect: 'qwerty',
          deposit: 'qwerty',
          owner: `01234567890123456789012345678901234567890123456789012
      345678901234567890123456789012345678901234567890123456
      7890123456789`,
          depositPath: 'qwerty',
        })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadRequest')
        expect(err).toHaveProperty('message', 'Data does not match schema')
        expect(err).toHaveProperty('errors', ["'owner' should NOT be longer than 120 characters"])
      }
    })
    it("doesn't throw if values are valid", async () => {
      expect.assertions(3)

      try {
        await service.send({
          to: validBitcoinAddresses[2],
          amount: 123,
          collect: 'qwerty',
          deposit: 'qwerty',
          owner: '0123456789012345678901234567890',
          depositPath: 'qwerty',
        })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadRequest')
        expect(err).toHaveProperty('message', "'collect' is not a valid BTC transaction.")
      }
    })
  })
})
