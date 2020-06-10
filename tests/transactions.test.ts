/* eslint-disable @typescript-eslint/ban-ts-comment */

import dotenv from 'dotenv'

import Service, { AuthDetails, RawTransaction, Results } from '../src/.'
import { wait } from './tools'
import { is } from 'ramda'

dotenv.config()

const { log } = console

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

process.on('unhandledRejection', () => {
  return
})

describe('Transactions', () => {
  let service: Service
  beforeAll(async () => {
    try {
      service = Service.getInstance({ authDetails }, true)
      await wait(5000)
    } catch (e) {
      return
    }
  })

  afterAll(async () => {
    service.disconnect()
    await wait(2000)
  })

  describe('getTransaction', () => {
    it('throws on missing argument', async () => {
      expect.assertions(3)

      try {
        // @ts-expect-error
        await service.getRawTransaction()
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty(
          'message',
          'Required argument (txid) in  argument of [getRawTransaction] function is missing.',
        )
      }
    })
    it('throws on wrong argument', async () => {
      expect.assertions(3)

      try {
        // @ts-expect-error
        await service.getRawTransaction(3, {respondDirect:true})
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty(
          'message',
          'Type of argument (txid) in function [getRawTransaction] is wrong - number. Should be string.',
        )
      }
    })
    it('returns response correctly', async () => {
      expect.assertions(1)

      try {
        const result = (await service.getRawTransaction(process.env.ID_HEX ?? '')) as Results<RawTransaction[]>

        expect(result).toEqual(null)
      } catch (err) {
        log(err)
      }
    })
  })
  describe('getTransactions', () => {
    it('throws on missing argument', async () => {
      expect.assertions(3)

      try {
        // @ts-expect-error
        await service.getRawTransactions()
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty(
          'message',
          'Required argument (txids) in  argument of [getRawTransactions] function is missing.',
        )
      }
    })
    it('throws on wrong argument', async () => {
      expect.assertions(3)

      try {
        // @ts-expect-error
        await service.getRawTransactions(3)
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty(
          'message',
          'Type of argument (txids) in function [getRawTransactions] is wrong - number. Should be string[].',
        )
      }
    })
     it('returns response correctly', async () => {
       expect.assertions(5)

       try {
         const result = (await service.getRawTransactions([
           process.env.ID_HEX ?? '',
           process.env.ID_HEX ?? '',
         ])) as Results<RawTransaction[]>

         expect(result.total).toEqual(0)
         expect(result.limit).toEqual(10)
         expect(result.skip).toEqual(0)
         expect(is(Array, result.data)).toEqual(true)
         expect(result.data.length).toEqual(0)
         // { total: 0, limit: 10, skip: 0, data: [] }
       } catch (err) {
         log(err)
       }
     })
  })
})

// it('throws on wrong argument key', async () => {
//   expect.assertions(3)

//   try {
//     // @ts-expect-error
//     await service.retrieve({ test: 'qwerty' })
//   } catch (err) {
//     expect(err).toBeInstanceOf(Object)
//     expect(err).toHaveProperty('name', 'BadProps')
//     expect(err).toHaveProperty('message', 'Extra key (test) found in data argument of [retrieve] function.')
//   }
// })
// it('gets response from API', async () => {
//   expect.assertions(3)

//   try {
//     // @ts-expect-error
//     await service.retrieve({ id: 'qwert', raw: 'qwerty' }, [])
//   } catch (err) {
//     expect(err).toBeInstanceOf(Object)
//     expect(err).toHaveProperty('name', 'BadProps')
//     expect(err).toHaveProperty('message', "Options object can't be empty")
//   }
// })
// })
