import Config from './config'
import {
  ServiceProps,
  Settings,
  Endpoints,
  ApiService,
  NetworkTip,
  ApiResponseError,
  Responses,
  DebugLevels,
  Logger,
  LoggerProps,
  EventBus,
  EventTypes,
  Retrievable,
  Collectable,
  ResponseCollectable,
  Status,
  Sendable,
  CollectRequest,
} from './types'
import verify from './verify'

class Service {
  private _settings: Settings
  private _eventBus: EventBus
  private _networks: ApiService
  private _transfers: ApiService
  private _inbox: ApiService
  private _collect: ApiService

  constructor(settings: ServiceProps | {}) {
    const { debug, currency, network, respond, eventBus } = settings as ServiceProps
    this._eventBus = eventBus ? eventBus : event => {}

    const config = new Config({ debug, currency, network })

    // store settings
    this._settings = {
      ...config.getSettings(),
      respond: respond || Responses.Direct,
    }

    // set services
    this._networks = config.getService(Endpoints.Networks)
    this._transfers = config.getService(Endpoints.Transfers)
    this._inbox = config.getService(Endpoints.Inbox)
    this._collect = config.getService(Endpoints.Collect)

    // choose the currency network
    this.getStatus()

    // event listeners

    // status update
    this._networks.on('patched', (data: NetworkTip) => {
      const { height, online } = data
      this._eventBus({
        type: EventTypes.UPDATE_STATUS,
        payload: { height, online },
      })
    })


  }

  private _respond = (type: EventTypes, payload: Status | Retrievable | Collectable[]) => {
    if (this._settings.respond === Responses.Direct) return payload
    if (this._settings.respond === Responses.Callback) this._eventBus({ type, payload })
  }

  private _log = ({ type, payload, message }: LoggerProps) => {
    // if not MUTE mode
    if (this._settings.debug !== DebugLevels.MUTE) {
      // errors are shown in all other modes
      if (!type) console.error(message)
      // info is shown only in verbose mode
      else if (type && this._settings.debug === DebugLevels.VERBOSE) console.log(message, payload)
    }
  }

  public getSettings = () => this._settings

  public getStatus = () =>
    this._networks
      .get(this._settings.network)
      .then((response: NetworkTip) => {
        const payload: Status = { height: response.height, online: response.online }
        this._log({ type: Logger.Info, payload, message: 'Service (getStatus): ' })
        return this._respond(EventTypes.UPDATE_STATUS, payload)
      })
      .catch((e: ApiResponseError) => {
        if (this._settings.respond === Responses.Direct) throw new Error(e.message)
        this._log({ type: Logger.Error, message: `Service (getStatus) got an error: ${e.message || 'unknown'}` })
      })

  public getRetrievable = (id: string) =>
    this._transfers
      .get(id)
      .then((payload: Retrievable) => {
        this._log({ type: Logger.Info, payload, message: 'Service (getRetrievable): ' })
        return this._respond(EventTypes.GET_RETRIEVABLE, payload)
      })
      .catch((e: ApiResponseError) => {
        if (this._settings.respond === Responses.Direct) throw new Error(e.message)
        this._log({ type: Logger.Error, message: `Service (getRetrievable) got an error. ${e.message}` })
      })

  public getCollectables = (address: string) =>
    this._inbox
      .find({ query: { to: address } })
      .then((payload: ResponseCollectable) => {
        this._log({ type: Logger.Info, payload: payload.data, message: 'Service (getCollectables): ' })
        return this._respond(EventTypes.GET_COLLECTABLES, payload.data)
      })
      .catch((e: ApiResponseError) => {
        if (this._settings.respond === Responses.Direct) throw new Error(e.message)
        this._log({ type: Logger.Error, message: `Service (getCollectables) got an error: ${e.message}` })
      })

  public send = async (transaction: Sendable) => {
    try {
      verify(transaction)
      const payload = await this._transfers.create(transaction)
      return this._respond(EventTypes.SEND_TRANSACTION, payload)
    } catch (e) {
      if (this._settings.respond === Responses.Direct) throw new Error(e.message)
      this._log({ type: Logger.Error, message: `Service (send) got an error. ${e.message}` })
    }
  }

  // TODO: change response type
  public collect = (request: CollectRequest) =>
    this._collect
      .create({ ...request })
      .then((payload: any) => {
        this._log({ type: Logger.Info, payload, message: 'Service (collect): ' })
        // TODO: what to return?
        return payload
      })
      .catch((e: ApiResponseError) => {
        if (this._settings.respond === Responses.Direct) throw new Error(e.message)
        this._log({ type: Logger.Error, message: `Service (collect) got an error. ${e.message}` })
      })
}

export * from './types'
export default Service
