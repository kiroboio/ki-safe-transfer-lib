/* eslint-disable @typescript-eslint/ban-ts-ignore */

import dotenv from 'dotenv'

import Service, { SwitchActions } from '../src'
import { TEXT } from '../src/data'
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
      service = new Service({ authDetails })
      await service.getStatus()
    } catch (e) {
      log(e)
      return
    }
  })
  afterAll(async () => {
    try {
      service.connect({ action: SwitchActions.CONNECT, value: false })
      await wait(2000)
    } catch (e) {
      log(e)
      return
    }
  })
  it('should not connect without authentication details', async () => {
    expect.assertions(2)

    try {
      // @ts-ignore
      new Service()
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
      expect(error).toHaveProperty('message', `${TEXT.errors.validation.missingArgument}: authDetails.`)
    }
  })
  it('provides status', () => {
    expect(service.connect({ action: SwitchActions.STATUS })).toBe(true)
  })
  it('allows to disconnect', () => {
    expect.assertions(2)

    try {
      expect(service.connect({ action: SwitchActions.STATUS })).toBe(true)
      service.connect({ action: SwitchActions.CONNECT, value: false })
      expect(service.connect({ action: SwitchActions.STATUS })).toBe(false)
    } catch (e) {
      log(e)
    }
  })
  afterAll(() => {
    service.connect({ action: SwitchActions.CONNECT, value: false })
  })
})
