/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import { Service, Event, Responses, SwitchActions } from '../src'
import {wait} from './tools'

dotenv.config()

const authDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

let result = {}

function eventBus(event: Event): void {
  result = event
}

const service = new Service({ respondAs: Responses.Callback, eventBus, authDetails })

describe('Getters', () => {
  afterAll(async () => {
    service.connect({ action: SwitchActions.CONNECT, value: false })
    await wait(2000)
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
    it('- throws if options are of wrong type', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getUtxos(['xxx'],[])
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Wrong type of argument')
      }
    })
  })
})
