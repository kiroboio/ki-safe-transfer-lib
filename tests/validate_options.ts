/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import { Service, Event, Responses, SwitchActions } from '../src'
import { wait } from './tools'

dotenv.config()

const authDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

let result = {}

function eventBus(event: Event): void {
  result = event
}

const service = new Service({ respondAs: Responses.Callback, eventBus, authDetails })

describe('Validate options', () => {
  afterAll(async () => {
    service.connect({ action: SwitchActions.CONNECT, value: false })
    await wait(2000)
  })
  describe(' throws on incorrect options:', () => {
    it('- throws if options are of wrong type', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getUtxos(['xxx'], [])
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Options can\'t be array. It should be: object {}.')
      }
    })
    it('- throws if options has wrong key', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getUtxos(['xxx'], { test: 'test' })
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty('message', 'Unknown key in \'getUtxos\' function\'s options: test')
      }
    })
    it('- throws if "respondDirect" is wrong value type', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getUtxos(['xxx'], { respondDirect: 'test' })
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty(
          'message',
          'Key \'respondDirect\' in \'getUtxos\' function\'s options has value of wrong type: string. Should be: boolean.',
        )
      }
    })
    it('- throws if "skip" is wrong value type', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getUtxos(['xxx'], { skip: 'test' })
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty(
          'message',
          'Key \'skip\' in \'getUtxos\' function\'s options has value of wrong type: string. Should be: number.',
        )
      }
    })
    it('- throws if "limit" is wrong value type', async () => {
      expect.assertions(2)

      try {
        // @ts-ignore
        await service.getUtxos(['xxx'], { limit: 'test' })
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError)
        expect(err).toHaveProperty(
          'message',
          'Key \'limit\' in \'getUtxos\' function\'s options has value of wrong type: string. Should be: number.',
        )
      }
    })
  })
})
