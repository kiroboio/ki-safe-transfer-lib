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
  ResponseCollect,
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

    const config = new Config({ debug, currency, network, eventBus, respond })

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

    // event listeners

    // status update
    this._networks.on('patched', (data: NetworkTip) => {
      const { height, online } = data
      this._eventBus({
        type: EventTypes.UPDATE_STATUS,
        payload: { height, online },
      })
    })

    // retrievable updated
    this._transfers.on('patched', (payload: Retrievable) => {
      this._eventBus({
        type: EventTypes.UPDATED_RETRIEVABLE,
        payload,
      })
    })

    // new collectable has been created for the previously requested address
    this._inbox.on('created', (payload: Collectable) => {
      this._eventBus({
        type: EventTypes.CREATED_COLLECTABLE,
        payload,
      })
    })

    // collectable updated
    this._inbox.on('updated', (payload: Collectable) => {
      this._eventBus({
        type: EventTypes.UPDATED_COLLECTABLE,
        payload,
      })
    })

    // collectable removed
    this._inbox.on('removed', (payload: Collectable) => {
      this._eventBus({
        type: EventTypes.REMOVED_COLLECTABLE,
        payload,
      })
    })
  }

  // responder
  private _respond = (type: EventTypes, payload: Status | Retrievable | Collectable[] | ResponseCollect) => {
    if (this._settings.respond === Responses.Direct) return payload
    if (this._settings.respond === Responses.Callback) this._eventBus({ type, payload })
  }

  // logger
  private _log = ({ type, payload, message }: LoggerProps) => {
    // if not MUTE mode
    if (this._settings.debug !== DebugLevels.MUTE) {
      // errors are shown in all other modes
      if (!type) console.error(message)
      // info is shown only in verbose mode
      else if (type && this._settings.debug === DebugLevels.VERBOSE) console.log(message, payload)
    }
  }

  // show settings
  public getSettings = () => this._settings

  // get current API status (height and online)
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

  // get retrievable by ID
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

  // get all collectables by recipient address
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

  // send retrievable/collectable transaction
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

  // collect transaction
  public collect = (request: CollectRequest) =>
    this._collect
      .create({ ...request })
      .then((payload: ResponseCollect) => {
        this._log({ type: Logger.Info, payload, message: 'Service (collect): ' })
 return this._respond(EventTypes.SEND_TRANSACTION, payload)
        return payload
      })
      .catch((e: ApiResponseError) => {
        if (this._settings.respond === Responses.Direct) throw new Error(e.message)
        this._log({ type: Logger.Error, message: `Service (collect) got an error. ${e.message}` })
      })
}

export * from './types'
export default Service
