import Service, { DebugLevels, Currencies, Networks, Responses, Event, Sendable } from '../src'

function eventBus(event: Event) {
  console.log('event fired: ', event)
}

// const service = new Service({})
const service = new Service({
  debug: DebugLevels.QUIET,
  respondAs: Responses.Callback,
  eventBus,
})

service.getStatus()

// service.clearLastAddresses()
