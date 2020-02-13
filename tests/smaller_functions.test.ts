import Service, { DebugLevels, Responses, Event } from '../src'
import { TEXT, validBitcoinAddresses } from '../src/data'
import { makeStringFromTemplate } from '../src/tools'

let storedEvent: Event

function eventBus(event: Event) {
  storedEvent = event
}

const service = new Service({ debug: DebugLevels.MUTE, eventBus, respondAs: Responses.Callback })
const serviceDirect = new Service({ debug: DebugLevels.MUTE })

process.on('unhandledRejection', () => {})

describe('Smaller functions', () => {
  describe('- getStatus', () => {
    test("- returns information in 'Direct' mode", async () => {
      const result = await serviceDirect.getStatus()
      console.log(result)
    })
  })
})
