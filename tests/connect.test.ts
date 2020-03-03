import Service, { SwitchActions } from '../src'
import { ENV } from '../src/env'
import { TEXT } from '../src/data'

process.on('unhandledRejection', () => { })

describe('Connect', () => {
  let service: Service
  beforeAll(async () => {
    try {
      service = await new Service({ authDetails: { ...ENV.auth } })
      await service.getStatus()
    } catch (e) {}
  })
  it('should not connect without authentication details', async () => {
    expect.assertions(2)

    try {
      // @ts-ignore
      await new Service()
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
      expect(error).toHaveProperty('message', `${TEXT.errors.validation.missingArgument}: authDetails.`)
    }
  })
  it('provides status', () => {
    expect(service.connect({ action: SwitchActions.STATUS })).toBe(true)
  })
  it('allows to disconnect', () => {
    expect.assertions(2)
    expect(service.connect({ action: SwitchActions.STATUS })).toBe(true)
    service.connect({ action: SwitchActions.CONNECT, value: false })
    expect(service.connect({ action: SwitchActions.STATUS })).toBe(false)
  })
  afterAll(() => {
    service.connect({ action: SwitchActions.CONNECT, value: false })
  })
})
