/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import Service, { DebugLevels, SwitchActions } from '../src'
import { wait } from './tools'

dotenv.config()

const authDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

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
         expect(err).toHaveProperty('message', 'Data is malformed. Missing values: to, amount, collect, deposit, owner.')
      }
    })
  })
})
