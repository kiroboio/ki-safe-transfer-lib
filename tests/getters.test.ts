/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import { Service, Event, Responses, SwitchActions, EventTypes } from '../src'
import { wait } from './tools'
import { keys } from 'ramda'

dotenv.config()

const authDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

let result: Event = { type: EventTypes.SEND_MESSAGE, payload: [] }

function eventBus(event: Event): void {
  result = event
}

const service = new Service({ respondAs: Responses.Callback, eventBus, authDetails })

describe('Getters', () => {
  afterAll(async () => {
    service.connect({ action: SwitchActions.CONNECT, value: false })
    await wait(2000)
  })
  describe(' getUsed:', () => {
    it('- throws if parameter are not provided', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getFresh()
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Addresses are missing. Nothing to search.')
      }
    })
    it('- throws if parameter are of wrong type', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getFresh(0)
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Wrong type of argument')
      }
    })
    it('- sends result through eventBus', async () => {
      expect.assertions(2)

      try {
        await service.getFresh(['xxx'])

        const { type, payload } = result

        expect(type).toEqual('service_get_fresh')
        expect(keys(payload).length).toBe(4)
      } catch (err) {
        console.log(err)
      }
    })
    it('- returns result directly with "respondDirect" option override', async () => {
      expect.assertions(1)

      try {
        const response = await service.getFresh(['xxx'], { respondDirect: true })

        expect(keys(response).length).toBe(4)
      } catch (err) {
        console.log(err)
      }
    })
  })
  describe(' getFresh:', () => {
    it('- throws if parameter are not provided', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getFresh()
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Addresses are missing. Nothing to search.')
      }
    })
    it('- throws if parameter are of wrong type', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getFresh(0)
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Wrong type of argument')
      }
    })
    it('- sends result through eventBus', async () => {
      expect.assertions(2)

      try {
        await service.getFresh(['xxx'])

        const { type, payload } = result

        expect(type).toEqual('service_get_fresh')
        expect(keys(payload).length).toBe(4)
      } catch (err) {
        console.log(err)
      }
    })
    it('- returns result directly with "respondDirect" option override', async () => {
      expect.assertions(1)

      try {
        const response = await service.getFresh(['xxx'], { respondDirect: true })

        expect(keys(response).length).toBe(4)
      } catch (err) {
        console.log(err)
      }
    })
  })
  describe(' getUtxos:', () => {
    it('- throws if parameter are not provided', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getUtxos()
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Addresses are missing. Nothing to search.')
      }
    })
    it('- throws if parameter are of wrong type', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getUtxos(0)
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Wrong type of argument')
      }
    })
    it('- sends result through eventBus', async () => {
      expect.assertions(2)

      try {
        await service.getUtxos(['xxx'])

        const { type, payload } = result

        expect(type).toEqual('service_get_utxos')
        expect(keys(payload).length).toBe(4)
      } catch (err) {
        console.log(err)
      }
    })
    it('- returns result directly with "respondDirect" option override', async () => {
      expect.assertions(1)

      try {
        const response = await service.getUtxos(['xxx'], { respondDirect: true })

        expect(keys(response).length).toBe(4)
      } catch (err) {
        console.log(err)
      }
    })
  })
})
