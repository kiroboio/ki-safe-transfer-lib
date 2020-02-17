import Service, { SwitchActions } from '../src'

process.on('unhandledRejection', () => {})

describe('Connect', () => {
  let service: Service
  beforeAll(async () => {
    service = new Service()
    await service.getStatus()
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

  it('allows to connect if disconnected', async () => {
    expect.assertions(2)
    const checkConnect: unknown = service.connect({ action: SwitchActions.STATUS })
    if (checkConnect) service.connect({ action: SwitchActions.CONNECT, value: false })
    expect(service.connect({ action: SwitchActions.STATUS })).toBe(false)
    service.connect({ action: SwitchActions.CONNECT, value: true })
    await service.getStatus()
    expect(service.connect({ action: SwitchActions.STATUS })).toBe(true)
  })
  it('toggles connection, if no value is provided', () => {
    expect.assertions(2)
    expect(service.connect({ action: SwitchActions.STATUS })).toBe(true)
    service.connect({ action: SwitchActions.CONNECT })
    expect(service.connect({ action: SwitchActions.STATUS })).toBe(false)
  })
  afterAll(() => {
    service.connect({ action: SwitchActions.CONNECT, value: false })
  })
})
