import Service, { DebugLevels, Currencies, Networks, Responses, Event, Sendable } from '../src'

let storedEvent: {}

function eventBusMockUp(event: Event) {
  console.log(event)
  storedEvent = event
}

test('service runs without options', async () => {
  const service = new Service()
  await service.getStatus()
})
