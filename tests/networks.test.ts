import dotenv from 'dotenv'

import Service, { Event, AuthDetails, Responses } from '../src/.'
import { wait, getEventByType } from './tools'
import { Type } from '../src/tools'

dotenv.config()

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

let events: Event[] = []

function eventBus(event: Event): void {
  events.push(event)
}

process.on('unhandledRejection', () => {
  return
})

describe('Networks', () => {
  let service: Service
  beforeAll(async () => {
    try {
      service = Service.createInstance({ authDetails, eventBus, respondAs: Responses.Callback })
      await wait(10000)
    } catch (e) {
      return
    }
  })
  beforeEach(() => {
    events = []
  })
  it('get online networks with details', async () => {
    expect.assertions(2)

    await service.getOnlineNetworks()

    const event = getEventByType(events, 'service_get_online_networks')

    const payload = event?.payload

    const data = Type<{ data: unknown[] }>(payload).data

    expect(payload).toHaveProperty('total')
    expect(data.length).not.toEqual(0)
  })
})
