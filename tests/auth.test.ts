import dotenv from 'dotenv'

import Service, { Event, SwitchActions, AuthDetails, RatesProviders, Responses } from '../src'
import { wait, getEventByType } from './tools'
import { changeType } from '../src/tools'

dotenv.config()

const controlDetails: AuthDetails = { key: 'testKey', secret: 'testSecret' }

let events: Event[] = []

function eventBus(event: Event): void {
  events.push(event)
}

process.on('unhandledRejection', () => {
  return
})

describe('Authentication', () => {
  let incorrect: Service
  beforeAll(async () => {
    try {
      incorrect = new Service({ authDetails: controlDetails, eventBus, respondAs: Responses.Callback })
      await wait(5000)
    } catch (e) {
      return
    }
  })
  beforeEach(() => {
    events = []
  })
  afterAll(async () => {
    incorrect.connect({ action: SwitchActions.CONNECT, value: false })
    await wait(2000)
  })
  it('throws error on incorrect auth details', async () => {
    expect.assertions(1)

    try {
      await incorrect.getStatus()
    } catch (err) {
      expect(err).toHaveProperty('message', 'Not authenticated')
    }
  })
})
