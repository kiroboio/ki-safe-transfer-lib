import Service, { DebugLevels, Responses, Event } from '../src'
import { TEXT, validBitcoinAddresses, listOfStatusKeys, typeOfStatusValues } from '../src/data'
import { makeStringFromTemplate } from '../src/tools'
import { validateObject } from '../src/validators'
import { ObjectWithStringKeysAnyValues } from '../src//types'

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
      let keysValuesCheck = true
      try {
        validateObject(result)
      } catch (e) {
        keysValuesCheck = false
      }
      Object.keys(result).forEach(key => {
        if (!listOfStatusKeys.includes(key)) keysValuesCheck = false
        const resValType = typeof result[key]
        const reqValType = typeOfStatusValues[key]
        if (resValType !== reqValType) keysValuesCheck = false
      })

      expect(keysValuesCheck).toBe(true)
    })
    test("- returns information in 'Callback' mode", async () => {
      expect.assertions(2)
      await service.getStatus()
      console.log(storedEvent)
      expect(storedEvent.type).toBe('service_update_status')
      const result: ObjectWithStringKeysAnyValues = storedEvent.payload
      let keysValuesCheck = true
      try {
        validateObject(result)
      } catch (e) {
        keysValuesCheck = false
      }
      Object.keys(result).forEach(key => {
        if (!listOfStatusKeys.includes(key)) keysValuesCheck = false
        const resValType = typeof result[key]
        const reqValType = typeOfStatusValues[key]
        if (resValType !== reqValType) keysValuesCheck = false
      })

      expect(keysValuesCheck).toBe(true)
    })
  })
  describe('- getStatus', () => {
    test("- returns information in 'Callback' mode", async () => {})
  })
})
