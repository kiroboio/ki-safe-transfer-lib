/* eslint-disable @typescript-eslint/ban-ts-comment */
import dotenv from 'dotenv'

import { Service, Event, Responses, EventTypes } from '../src'
import { wait, getEventByType } from './tools'
import { keys } from 'ramda'

dotenv.config()

const { log } = console

const authDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

let events: Event[] = []

function eventBus(event: Event): void {
  events.push(event)
}

describe('Getters', () => {
  let service: Service
  beforeAll(async () => {
    try {
      service = Service.getInstance({ authDetails, eventBus, respondAs: Responses.Callback }, true)
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

  it('getByOwnerId: sends result through eventBus', async () => {
    expect.assertions(2)

    try {
      await service.getByOwnerId('xxx')

      const event = getEventByType(events, EventTypes.GET_BY_OWNER_ID)

      const { type, payload } = event as Event

      expect(type).toEqual(EventTypes.GET_BY_OWNER_ID)
      expect(keys(payload).length).toBe(4)
    } catch (err) {
      log(err)
    }
  })
  it('getByOwnerId: returns result directly with "respondDirect" option override', async () => {
    expect.assertions(1)

    try {
      const response = await service.getByOwnerId('xxx', { respondDirect: true })

      expect(keys(response).length).toBe(4)
    } catch (err) {
      log(err)
    }
  })
  it('getUsed: sends result through eventBus', async () => {
    expect.assertions(2)

    try {
      await service.getUsed(['xxx'])

      const event = getEventByType(events, EventTypes.GET_USED)

      const { type, payload } = event as Event

      expect(type).toEqual(EventTypes.GET_USED)
      expect(keys(payload).length).toBe(4)
    } catch (err) {
      log(err)
    }
  })
  it('getUsed: returns result directly with "respondDirect" option override', async () => {
    expect.assertions(1)

    try {
      const response = await service.getUsed(['xxx'], { respondDirect: true })

      expect(keys(response).length).toBe(4)
    } catch (err) {
      log(err)
    }
  })
  it('getFresh: sends result through eventBus', async () => {
    expect.assertions(2)

    try {
      await service.getFresh(['xxx'])

      const event = getEventByType(events, EventTypes.GET_FRESH)

      const { type, payload } = event as Event

      expect(type).toEqual(EventTypes.GET_FRESH)
      expect(keys(payload).length).toBe(4)
    } catch (err) {
      log(err)
    }
  })
  it('getFresh: returns result directly with "respondDirect" option override', async () => {
    expect.assertions(1)

    try {
      const response = await service.getFresh(['xxx'], { respondDirect: true })

      expect(keys(response).length).toBe(4)
    } catch (err) {
      log(err)
    }
  })
  it('getUtxos: throws on missing argument', async () => {
    expect.assertions(3)

    try {
      // @ts-expect-error
      await service.getUtxos()
    } catch (err) {
      expect(err).toBeInstanceOf(Object)
      expect(err).toHaveProperty('name', 'BadProps')
      expect(err).toHaveProperty(
        'message',
        'Required argument (addresses) in getUtxos argument of [%3] function is missing.',
      )
    }
  })
  it('getUtxos: throws on incorrect argument', async () => {
    expect.assertions(3)

    try {
      // @ts-expect-error
      await service.getUtxos('xxx')
    } catch (err) {
      expect(err).toBeInstanceOf(Object)
      expect(err).toHaveProperty('name', 'BadProps')
      expect(err).toHaveProperty(
        'message',
        'Type of argument (addresses) in function [getUtxos] is wrong - string. Should be string[].',
      )
    }
  })
  it('getUtxos: throws on empty argument', async () => {
    expect.assertions(3)

    try {
      await service.getUtxos([])
    } catch (err) {
      expect(err).toBeInstanceOf(Object)
      expect(err).toHaveProperty('name', 'BadProps')
      expect(err).toHaveProperty('message', 'Required argument (addresses) of [getUtxos] function is empty.')
    }
  })
  it('getUtxos: sends result through eventBus', async () => {
    expect.assertions(2)

    try {
      await service.getUtxos(['xxx'])

      const event = getEventByType(events, EventTypes.GET_UTXOS)

      const { type, payload } = event as Event

      expect(type).toEqual(EventTypes.GET_UTXOS)
      expect(keys(payload).length).toBe(4)
    } catch (err) {
      log(err)
    }
  })
  it('getUtxos: returns result directly with "respondDirect" option override', async () => {
    expect.assertions(1)

    try {
      const response = await service.getUtxos(['xxx'], { respondDirect: true })

      expect(keys(response).length).toBe(4)
    } catch (err) {
      log(err)
    }
  })
})
