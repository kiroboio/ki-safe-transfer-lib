import dotenv from 'dotenv'

import { wait, getEventByType } from './tools'
import { changeType } from '@src/tools'
import Service, { AuthDetails, Responses, RatesSources, Event } from '@src/.'

dotenv.config()

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

let events: Event[] = []

function eventBus(event: Event): void {
  events.push(event)
}

process.on('unhandledRejection', () => {
  return
})

describe('Rates', () => {
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
  it('throws on incorrect options', async () => {
    expect.assertions(3)

    try {
      // @ts-expect-error
      await service.getRates({ testing: 'test' })
    } catch (err) {
      expect(err).toBeInstanceOf(Object)
      expect(err).toHaveProperty('name', 'BadProps')
      expect(err).toHaveProperty('message', 'Extra key (testing) found in options argument of [getRates] function.')
    }
  })
  it('gets rates from three sources', async () => {
    expect.assertions(2)

    await service.getRates()

    const event = getEventByType(events, 'service_get_btc_to_usd_rates')

    const payload = event?.payload

    const data = changeType<{ data: unknown[] }>(payload).data

    expect(payload).toHaveProperty('total', 3)

    expect(data.length).toEqual(3)
  })
  it('gets rate from a single specified source', async () => {
    expect.assertions(1)

    await service.getRate({ source: RatesSources.COINGECKO })

    const event = getEventByType(events, 'service_get_btc_to_usd_rate')

    const payload = event?.payload

    expect(payload).toHaveProperty('source', 'coingecko.com')
  })
  it('gets rates from a default source, if non specified', async () => {
    expect.assertions(1)

    await service.getRate()

    const event = getEventByType(events, 'service_get_btc_to_usd_rate')

    const payload = event?.payload

    expect(payload).toHaveProperty('source', 'bitfinex.com')
  })
})
