/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import { Service, DebugLevels, Responses, Event, AuthDetails } from '../src'
import { wait } from './tools'

dotenv.config()

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function eventBus(event: Event): void {
  return
}

async function callbackService(): Promise<Service> {
  const service = new Service({ eventBus, respondAs: Responses.Callback, authDetails })

  await service.getStatus()
  return service
}

process.on('unhandledRejection', () => {
  return
})

describe('Retrievable', () => {
  let service: Service
  beforeAll(async () => {
    try {
      service = new Service({ debug: DebugLevels.MUTE, eventBus, authDetails })
      await service.getStatus()
    } catch (e) {
      return
    }
  })

  afterAll(async () => {
    service.disconnect()
    await wait(2000)
  })


  it('throws "not found" error in case of correct request', async () => {
    expect.assertions(2)

    const id = 'xxxxxxxxxx'

    try {
      await service.getRetrievable(id)
    } catch (error) {
      expect(error).toBeInstanceOf(Object)
      expect(error).toHaveProperty('message', `No record found for id '${id}'`)
    }
  })
  it('get "not found" error even if in "Callback mode"', async () => {
    expect.assertions(2)

    const id = 'xxxxxxxxxx'

    try {
      const newService = await callbackService()

      await newService.getRetrievable(id)
    } catch (error) {
      expect(error).toBeInstanceOf(Object)
      expect(error).toHaveProperty('message', `No record found for id '${id}'`)
    }
  })
})
