/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import Service, { DebugLevels } from '../src'
import { wait } from './tools'
import { validBitcoinAddresses } from './test_data'

dotenv.config()

const authDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

process.on('unhandledRejection', () => {
  return
})

describe('Send', () => {
  let service: Service

  beforeAll(async () => {
    try {
      service = Service.getInstance({ debug: DebugLevels.MUTE, authDetails })
      await wait(2000)
    } catch (e) {
      return
    }
  })
   afterAll(async () => {
     service.disconnect()
     await wait(2000)
   })
  describe('empty/incorrect argument validation:', () => {
    it('throws Error on missing argument', async () => {
      expect.assertions(3)

      try {
        // @ts-ignore
        await service.send()
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Data is missing')
      }
    })
    it('throws TypeError argument with wrong type', async () => {
      try {
        // @ts-ignore
        await service.send(1234)
      } catch (err) {
         expect(err).toBeInstanceOf(Object)
         expect(err).toHaveProperty('name', 'BadProps')
         expect(err).toHaveProperty('message', 'Wrong type of argument')
      }
    })
    it('throws TypeError argument with empty object', async () => {
      try {
        // @ts-ignore
        await service.send({})
      } catch (err) {
         expect(err).toBeInstanceOf(Object)
         expect(err).toHaveProperty('name', 'BadProps')
         expect(err).toHaveProperty('message', 'Data is missing')
      }
    })
    it('throws TypeError for argument with unknown keys', async () => {
      try {
        await service.send({
        // @ts-ignore
          id: 'string',
          to: validBitcoinAddresses[2],
          amount: 123,
          collect: 'qwerty',
          deposit: 'qwerty',
          owner: '0123456789012345678901234567890',
          depositPath: 'qwerty',
        })
      } catch (err) {
         expect(err).toBeInstanceOf(Object)
         expect(err).toHaveProperty('name', 'BadProps')
         expect(err).toHaveProperty('message', 'Wrong keys present: id.')
      }
    })
  })
})
