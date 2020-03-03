import Service, { DebugLevels, Responses } from '../src'

function eventBus(event: Event): void {
  // eslint-disable-next-line no-console
  console.log('event fired: ', event)
}

// const service = new Service({})
const service = new Service({
  debug: DebugLevels.QUIET,
  respondAs: Responses.Callback,
  eventBus,
  // authDetails
})

service.getStatus()

// service.clearLastAddresses()
