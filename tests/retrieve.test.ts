/* eslint-disable @typescript-eslint/ban-ts-comment */

import dotenv from 'dotenv'

import Service, { AuthDetails } from '../src/.'
import { wait, } from './tools'

dotenv.config()

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

process.on('unhandledRejection', () => {
  return
})

describe('Retrieve', () => {
  let service: Service
  beforeAll(async () => {
    try {
      service = Service.getInstance({ authDetails }, true)
      await wait(10000)
    } catch (e) {
      return
    }
  })

  it('throws on missing argument', async () => {
    expect.assertions(3)

    try {
      // @ts-expect-error
      await service.retrieve()
    } catch (err) {
      expect(err).toBeInstanceOf(Object)
      expect(err).toHaveProperty('name', 'BadProps')
      expect(err).toHaveProperty('message', 'Data is missing')
    }
  })
  it('throws on wrong argument key', async () => {
    expect.assertions(3)

    try {
      // @ts-expect-error
      await service.retrieve({test:'qwerty'})
    } catch (err) {
      expect(err).toBeInstanceOf(Object)
      expect(err).toHaveProperty('name', 'BadProps')
      expect(err).toHaveProperty('message', 'Extra key (test) found in data argument of [retrieve] function.')
    }
  })
  it('gets response from API', async () => {
    expect.assertions(3)

    try {
      // @ts-expect-error
      await service.retrieve({ id: 'qwert', raw: 'qwerty' }, [])
    } catch (err) {
      expect(err).toBeInstanceOf(Object)
      expect(err).toHaveProperty('name', 'BadProps')
      expect(err).toHaveProperty('message', 'Options object can\'t be empty')
    }
  })
})
