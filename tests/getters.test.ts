/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import { Service, Event, Responses, SwitchActions, EventTypes } from '../src'
import { wait } from './tools'
import { keys } from 'ramda'

dotenv.config()

const { log } = console

const authDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

let result: Event = { type: EventTypes.SEND_MESSAGE, payload: [] }

function eventBus(event: Event): void {
  result = event
}

const service = new Service({ respondAs: Responses.Callback, eventBus, authDetails })

describe('Getters', () => {
  afterEach(() => {
    result = { type: EventTypes.SEND_MESSAGE, payload: [] }
  })
  afterAll(async () => {
    service.connect({ action: SwitchActions.CONNECT, value: false })
    await wait(2000)
  })

  it('getByOwnerId: sends result through eventBus', async () => {
    expect.assertions(2)

    try {
      await service.getByOwnerId('xxx')

      const { type, payload } = result

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

      const { type, payload } = result

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

      const { type, payload } = result

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
  it('getUtxos: sends result through eventBus', async () => {
    expect.assertions(2)

    try {
      await service.getUtxos(['xxx'])

      const { type, payload } = result

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
