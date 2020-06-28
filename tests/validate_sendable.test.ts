/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import dotenv from 'dotenv'

import Service, { DebugLevels, AuthDetails, Responses } from '../src/.'
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
      service = Service.getInstance({ debug: DebugLevels.MUTE, authDetails }, true)
      await wait(10000)
    } catch (e) {
      return
    }
  })

  afterAll(async () => {
    service.disconnect()
    await wait(5000)
  })
  describe('empty/incorrect argument object validation:', () => {
    it('throws Error on missing argument', async () => {
      try {
        // @ts-expect-error
        await service.send()
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Data is missing')
      }
    })
    it('throws TypeError on array as argument', async () => {
      try {
        // @ts-expect-error
        await service.send([])
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Data is missing')
      }
    })
    it('throws TypeError on function as argument', async () => {
      try {
        // @ts-expect-error
        await service.send(() => {
          return
        })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Argument can\'t be a function.')
      }
    })
    it('throws TypeError non-object argument', async () => {
      try {
        // @ts-expect-error
        await service.send(1234)
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Wrong type of argument')
      }
    })
    it('throws Error on empty object', async () => {
      try {
        // @ts-expect-error
        await service.send({})
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Data is missing')
      }
    })
    it('throws Error on empty object', async () => {
      try {
        // @ts-expect-error
        await service.send({})
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Data is missing')
      }
    })
  })
  describe('argument key/value validation:', () => {
    it('throws if at least one missing required key or key with empty value', async () => {
      try {
        // @ts-expect-error
        await service.send({ to: validBitcoinAddresses[2], amount: 123, collect: 123, deposit: '', salt: 'qwerty' })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty(
          'message',
          'Wrong types of keys: collect (should be string). Missing required keys: owner.',
        )
      }
    })
    it('throws if there is wrong key', async () => {
      try {
        // @ts-expect-error
        await service.send({ to: validBitcoinAddresses[2], amount: 123, collect: 123, deposit: '', ownerId: 'string' })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty(
          'message',
          'Wrong keys present: ownerId. Wrong types of keys: collect (should be string). Missing required keys: owner, salt.',
        )
      }
    })
    it('throws if except for amount, everything else is not a \'string\', \'to\' - must be valid address', async () => {
      try {
        // @ts-expect-error
        await service.send({ to: 123, amount: 123, collect: 123, deposit: 'qwerty', owner: 123, salt: 123 })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Invalid address in "to".')
      }
    })
    it('throws if optional values are not of right type', async () => {
      try {
        await service.send({
          to: validBitcoinAddresses[2],
          // @ts-expect-error
          amount: '123',
          collect: 'qwerty',
          owner: 'string',
          // @ts-expect-error
          depositPath: 123,
          // @ts-expect-error
          deposit: 123,
          id: 1,
          // @ts-expect-error
          from: 2,
          // @ts-expect-error
          hint: 3,
          salt: 'qwerty',
        })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty(
          'message',
          'Wrong keys present: id. Wrong types of keys: amount (should be number), depositPath (should be string), deposit (should be string), from (should be string), hint (should be string). Wrong values: owner (should be between 20 and 120).',
        )
      }
    })
    it('throws if "owner" length is shorter than 20 symbols', async () => {
      expect.assertions(3)

      try {
        await service.send({
          to: validBitcoinAddresses[2],
          amount: 123,
          collect: 'qwerty',
          deposit: 'qwerty',
          owner: '12345678',
          depositPath: 'qwerty',
          salt: 'qwerty',
        })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Wrong values: owner (should be between 20 and 120).')
      }
    })
    it('throws if "owner" length is longer than 120 symbols', async () => {
      expect.assertions(3)

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
          salt: 'qwerty',
        })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Wrong values: owner (should be between 20 and 120).')
      }
    })
    //
    it('doesn\'t throw if values are valid', async () => {
      expect.assertions(3)

      try {
        await service.send({
          to: validBitcoinAddresses[2],
          amount: 123,
          collect: 'qwerty',
          deposit: 'qwerty',
          owner: '0123456789012345678901234567890',
          depositPath: 'qwerty',
          salt: 'qwerty',
        })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadRequest')
        expect(err).toHaveProperty('message', '\'deposit\' is not a valid BTC transaction.')
      }
    })
  })
})
