/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import Service, { Event, AuthDetails, RatesProviders, Responses } from '../src'
import { wait, getEventByType } from './tools'
import { changeType } from '../src/tools'

dotenv.config()

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

let events: Event[] = []

function eventBus(event: Event): void {
  events.push(event)
}

process.on('unhandledRejection', () => {
  return
})

describe('Retrieve', () => {
  let service: Service
  beforeAll(async () => {
    try {
      service = new Service({ authDetails })
      await wait(5000)
    } catch (e) {
      return
    }
  })
  beforeEach(() => {
    events = []
  })
  afterAll(async () => {
    service.disconnect()
    await wait(2000)
  })
  it('throws on missing argument', async () => {
    expect.assertions(3)

    try {
      // @ts-ignore
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
      // @ts-ignore
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
      // @ts-ignore
      await service.retrieve({ id: 'qwert', raw: 'qwerty' }, [])
    } catch (err) {
      expect(err).toBeInstanceOf(Object)
      expect(err).toHaveProperty('name', 'BadProps')
      expect(err).toHaveProperty('message', 'Options object can\'t be empty')
    }
  })
})
