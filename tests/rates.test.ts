import dotenv from 'dotenv'

import Service, { Event, SwitchActions, AuthDetails, RatesProviders, Responses } from '../src'
import { wait, getEventByType } from './tools'
import { changeType } from '../src/tools'

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
      service = new Service({ authDetails, eventBus, respondAs: Responses.Callback })
      await wait(5000)
    } catch (e) {
      return
    }
  })
  beforeEach(() => {
    events = []
  })
  afterAll(async () => {
    service.connect({ action: SwitchActions.CONNECT, value: false })
    await wait(2000)
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

    await service.getRate({ provider: RatesProviders.COINGECKO })

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
