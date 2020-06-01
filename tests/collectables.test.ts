
import dotenv from 'dotenv'

import Service, { Responses, Event, AuthDetails, Results } from '../src'
import { changeType } from '../src/tools'
import { wait } from './tools'
import { validBitcoinAddresses } from './test_data'

dotenv.config()

const { log } = console

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

const storedEvent: Event[] = []

function eventBus(event: Event): void {
  storedEvent.push(event)
}

process.on('unhandledRejection', () => {
  return
})

describe('Collectables', () => {
  let service: Service
  beforeAll(async () => {
    try {
      service = Service.getInstance({ authDetails, eventBus, respondAs: Responses.Callback }, true)
      await wait(2000)
    } catch (e) {
      return
    }
  })
  afterAll(async () => {
    service.disconnect()
    await wait(2000)
  })
  it('provides response as a result of proper request', async () => {
    try {
      expect.assertions(3)

      const response = await service.getCollectables([validBitcoinAddresses[2]], { respondDirect: true })

      const data = changeType<Results<unknown>>(response)

      expect(response).toBeInstanceOf(Object)
      expect(data.total).toEqual(0)
      expect(data.data.length).toEqual(0)
    } catch (err) {
      log(err)
    }
  })
  it('provides response through eventBus, if used', async () => {
    expect.assertions(4)

    const result = await service.getCollectables([validBitcoinAddresses[2]])

    expect(result).toBe(undefined)

    const event = storedEvent.filter(el => el.type === 'service_get_collectables')

    const data = changeType<Results<unknown>>(event[0].payload)

    expect(data).toBeInstanceOf(Object)
    expect(data.total).toEqual(0)
    expect(data.data.length).toEqual(0)
  })
})
