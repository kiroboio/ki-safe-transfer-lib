/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import Service, { DebugLevels, AuthDetails, SwitchActions } from '../src'
import { TEXT } from '../src/data'

dotenv.config()

const authDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

process.on('unhandledRejection', () => {
  return
})

describe('Send', () => {
  let service: Service

  beforeAll(async () => {
    try {
      service = new Service({ debug: DebugLevels.MUTE, authDetails })
      await service.getStatus()
    } catch (e) {
      return
    }
  })
  afterAll(() => {
    service.connect({ action: SwitchActions.CONNECT, value: false })
  })
  describe('- empty/incorrect argument validation', () => {
    test('- throws Error on missing argument', async () => {
      try {
        // @ts-ignore
        await service.send()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toHaveProperty('message', TEXT.errors.validation.missingArgument)
      }
    })
    test('- throws TypeError argument with wrong type', async () => {
      try {
        // @ts-ignore
        await service.send(1234)
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty('message', TEXT.errors.validation.typeOfObject)
      }
    })
    test('- throws TypeError argument with empty object', async () => {
      try {
        // @ts-ignore
        await service.send({})
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect(error).toHaveProperty(
          'message',
          `${TEXT.errors.validation.malformedData} ${TEXT.errors.validation.missingValues}to, amount, collect, deposit.`,
        )
      }
    })
  })
})
