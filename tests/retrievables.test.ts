/* eslint-disable @typescript-eslint/ban-ts-ignore */
import dotenv from 'dotenv'

import { Service, DebugLevels, Responses, Event, AuthDetails, SwitchActions, Results } from '../src'
import { wait } from './tools'
import { changeType } from '../src/tools'

dotenv.config()

const { log } = console

const authDetails: AuthDetails = { key: process.env.AUTH_KEY ?? '', secret: process.env.AUTH_SECRET ?? '' }

const ids = ['xxxxxxxxxx', 'xxxxxxxxx']

let result: Event

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function eventBus(event: Event): void {
  result = event
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function callbackService() {
  const srv = new Service({ eventBus, respondAs: Responses.Callback, authDetails })

  await srv.getStatus()
  return srv
}

process.on('unhandledRejection', () => {
  return
})

describe('Retrievables', () => {
  let service: Service
  beforeAll(async () => {
    try {
      service = new Service({ debug: DebugLevels.MUTE, authDetails })
      await service.getStatus()
    } catch (e) {
      return
    }
  })
  afterAll(async () => {
    service.connect({ action: SwitchActions.CONNECT, value: false })
    await wait(2000)
  })
  it('provides "not found" error in case of correct request', async () => {
    expect.assertions(3)

    try {
      const response = await service.getRetrievables(ids)

      const data = changeType<Results<unknown>>(response)

      expect(response).toBeInstanceOf(Object)
      expect(data.total).toEqual(0)
      expect(data.data.length).toEqual(0)
    } catch (err) {
      log(err)
    }
  })
  it('gets "not found" error even if in "Callback mode"', async () => {
    expect.assertions(3)

    try {
      const newService = await callbackService()

      await newService.getRetrievables(ids)

      const data = changeType<Results<unknown>>(result.payload)

      expect(data).toBeInstanceOf(Object)
      expect(data.total).toEqual(0)
      expect(data.data.length).toEqual(0)
    } catch (err) {
      log(err)
    }
  })
})
