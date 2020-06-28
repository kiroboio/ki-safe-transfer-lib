import dotenv from 'dotenv'

import Service, { Responses } from '../src'
import { wait } from './tools'

dotenv.config()

const { log } = console

const authDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

process.on('unhandledRejection', () => {
  return
})

describe('Connect', () => {
    let service: Service

  beforeAll(async () => {
    try {
      service = Service.getInstance({ authDetails, respondAs: Responses.Direct }, true)
      await wait(10000)
    } catch (e) {
      log(e)
      return
    }
  })
  afterAll(async () => {
    try {
      service.disconnect()
      await wait(2000)
    } catch (e) {
      log(e)
      return
    }
  })
  it('provides status', () => {
    expect(service.getConnectionStatus()).toBe(true)
  })
  it('allows to disconnect, checks for options', async () => {
    expect.assertions(2)

    try {
      expect(service.getConnectionStatus()).toBe(true)
      service.disconnect()
      await wait(2000)
      expect(service.getConnectionStatus()).toBe(false)
    } catch (e) {
      log(e)
    }
  })
  it('allows to connect, checks for options', async () => {
    expect.assertions(2)

    try {
      expect(service.getConnectionStatus()).toBe(false)
      service.connect()
      await wait(10000)
      expect(service.getConnectionStatus()).toBe(true)
    } catch (e) {
      log(e)
    }
  })
})
