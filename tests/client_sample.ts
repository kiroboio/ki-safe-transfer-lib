import Service, { DebugLevels, Responses, Event } from '../src'
import dotenv from 'dotenv'

dotenv.config()

const authDetails = { key: process.env.AUTH_KEY || '', secret: process.env.AUTH_SECRET||'' }

function eventBus(event: Event): void {
  // eslint-disable-next-line no-console
  console.log('event fired: ', event)
}

// const service = new Service({})
const service = new Service({
  debug: DebugLevels.QUIET,
  respondAs: Responses.Callback,
  eventBus,
  authDetails
})

service.getStatus()

// service.clearLastAddresses()
