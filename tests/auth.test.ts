import dotenv from 'dotenv'

import Service, { Event, AuthDetails, Responses } from '../src'
import { wait } from './tools'

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
      incorrect = Service.getInstance({ authDetails: controlDetails, eventBus, respondAs: Responses.Direct }, true)
      await wait(5000)
    } catch (e) {
      return
    }
  })
  beforeEach(() => {
    events = []
  })
  afterAll(async () => {
    incorrect.disconnect()
    await wait(2000)
  })
  it('throws error on incorrect auth details', async () => {
    expect.assertions(1)

    //  TODO: check
    try {
      await incorrect.getStatus()
    } catch (err) {
      expect(err).toHaveProperty('message', 'Not authenticated')
    }
  })
})
