
import dotenv from 'dotenv'

import { Service, Event, Responses } from '@src/.'
import { wait } from './tools'

dotenv.config()

const authDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

function eventBus(_event: Event): void {
  return
}

const service = Service.getInstance({ respondAs: Responses.Callback, eventBus, authDetails }, true)

describe('Validate options', () => {
  afterAll(async () => {
    service.disconnect()
    await wait(2000)
  })
  describe(' throws on incorrect options:', () => {
    it('throws if options are of wrong type', async () => {
      expect.assertions(3)

      try {
        // @ts-expect-error
        await service.getUtxos(['xxx'], [])
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Options object can\'t be empty')
      }
    })
    it('throws if options has wrong key', async () => {
      expect.assertions(3)

      try {
        // @ts-expect-error
        await service.getUtxos(['xxx'], { test: 'test' })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty('message', 'Extra key (test) found in options argument of [getUtxos] function.')
      }
    })
    it('throws if "respondDirect" is wrong value type', async () => {
      expect.assertions(3)

      try {
        // @ts-expect-error
        await service.getUtxos(['xxx'], { respondDirect: 'test' })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty(
          'message',
          'Key \'respondDirect\' in \'getUtxos\' function\'s options has value of wrong type: string. Should be boolean.',
        )
      }
    })
    it('throws if "skip" is wrong value type', async () => {
      expect.assertions(3)

      try {
        // @ts-expect-error
        await service.getUtxos(['xxx'], { skip: 'test' })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty(
          'message',
          'Key \'skip\' in \'getUtxos\' function\'s options has value of wrong type: string. Should be number.',
        )
      }
    })
    it('throws if "limit" is wrong value type', async () => {
      expect.assertions(3)

      try {
        // @ts-expect-error
        await service.getUtxos(['xxx'], { limit: 'test' })
      } catch (err) {
        expect(err).toBeInstanceOf(Object)
        expect(err).toHaveProperty('name', 'BadProps')
        expect(err).toHaveProperty(
          'message',
          'Key \'limit\' in \'getUtxos\' function\'s options has value of wrong type: string. Should be number.',
        )
      }
    })
  })
})
