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
  Message,
} from './types'
import { validateAddress, validateData } from './validators'

// TODO: add comments
/**
 * Kirobo Safe Transfer library class to provide convenient
 * way to use the service
 * @class
 * @name Service
 */
class Service {
  private _settings: Settings
  private _eventBus: EventBus
  private _networks: ApiService
  private _transfers: ApiService
  private _inbox: ApiService
  private _collect: ApiService
  private _lastAddresses: string[] = [] // caching last addresses request

  constructor(settings?: ServiceProps ) {
    const { debug, currency, network, respondAs, eventBus } = settings as ServiceProps
    this._eventBus = eventBus ? eventBus : event => {}

    const config = new Config({
      debug,
      currency,
      network,
      logger: this._logger,
      getStatus: this.getStatus,
      refreshInbox: this._refreshInbox,
    })

    // store settings
    this._settings = {
      ...config.getSettings(),
      respondAs: respondAs || Responses.Direct,
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
  private _responder = (
    type: EventTypes,
    payload: Status | Retrievable | Collectable[] | ResponseCollect | Message,
  ) => {
    if (this._settings.respondAs === Responses.Direct) return payload
    // calling provided function as eventBus might result in error
    try {
      if (this._settings.respondAs === Responses.Callback) this._eventBus({ type, payload })
    } catch (e) {
      this._logger({ type: Logger.Error, message: `eventBus got an error. ${e}` })
    }
  }

  // logger
  private _logger = ({ type, payload, message }: LoggerProps) => {
    // if not MUTE mode
    if (this._settings.debug !== DebugLevels.MUTE) {
      // errors are shown in all other modes
      if (!type) console.error(message)
      // info is shown only in verbose mode
      else if (type && this._settings.debug === DebugLevels.VERBOSE) console.log(message, payload)
    }
  }

  // send error
  private _errLogger = (message: string, error: string) =>
    this._logger({ type: Logger.Error, message: `${message}${error ? ' ' + error : ''}` })

  private _refreshInbox = () => {
    if (this._lastAddresses.length)
      return this._inbox
        .find({ query: { to: this._lastAddresses.join(';') } })
        .then((payload: ResponseCollectable) => {
          console.log(payload)
          this._eventBus({ type: EventTypes.GET_COLLECTABLES, payload: payload.data })
        })
        .catch((e: ApiResponseError) => {
          this._logger({
            type: Logger.Error,
            message: `Service (getCollectables) got an error: ${e.message || 'unknown'}`,
          })
        })
  }

  // get last addresses
  public getLastAddresses = () => this._lastAddresses

  // clear cached addresses
  public clearLastAddresses = () => (this._lastAddresses = [])

  // show settings
  public getSettings = () => this._settings

  // get current API status (height and online)
  public getStatus = () =>
    this._networks
      .get(this._settings.network)
      .then((response: NetworkTip) => {
        const payload: Status = { height: response.height, online: response.online }
        this._logger({ type: Logger.Info, payload, message: 'Service (getStatus): ' })
        return this._responder(EventTypes.UPDATE_STATUS, payload)
      })
      .catch((e: ApiResponseError) => {
        if (this._settings.respondAs === Responses.Direct) throw new Error(e.message)
        this._errLogger(`Service (getStatus) got an error.`, e.message)
      })

  // get retrievable by ID
  public getRetrievable = (id: string) =>
    this._transfers
      .get(id)
      .then((payload: Retrievable) => {
        this._logger({ type: Logger.Info, payload, message: 'Service (getRetrievable): ' })
        return this._responder(EventTypes.GET_RETRIEVABLE, payload)
      })
      .catch((e: ApiResponseError) => {
        if (this._settings.respondAs === Responses.Direct) throw new Error(e.message)
        this._errLogger(`Service (getRetrievable) got an error.`, e.message)
      })

  // get all collectables by recipient address
  public getCollectables = async (addresses: string[]) => {
    try {
      if (!Array.isArray(addresses)) throw new Error('Malformed request. Not an array.')
      addresses.forEach(address => {
        if (!validateAddress({ address, currency: this._settings.currency, networkType: this._settings.network }))
          throw new Error(`Malformed address: ${address}`)
      })

      const payload: ResponseCollectable = await this._inbox.find({ query: { to: addresses.join(';') } })

      this._lastAddresses = addresses

      this._logger({ type: Logger.Info, payload: payload.data, message: 'Service (getCollectables): ' })

      return this._responder(EventTypes.GET_COLLECTABLES, payload.data)
    } catch (e) {
      if (this._settings.respondAs === Responses.Direct) throw new Error(e.message)
      this._errLogger(`Service (getCollectables) got an error.`, e.message)
    }
  }

  // send retrievable/collectable transaction
  public send = async (transaction: Sendable) => {
    try {
      validateData(transaction, this._settings.currency, this._settings.network)

      const payload = await this._transfers.create(transaction)
      return this._responder(EventTypes.SEND_TRANSACTION, payload)
    } catch (e) {
      if (this._settings.respondAs === Responses.Direct) throw new Error(e.message)
      this._errLogger(`Service (send) got an error.`, e.message)
    }
  }

  // collect transaction
  public collect = (request: CollectRequest) =>
    this._collect
      .create({ ...request })
      .then((payload: ResponseCollect) => {
        this._logger({ type: Logger.Info, payload, message: 'Service (collect): ' })

        return this._responder(EventTypes.COLLECT_TRANSACTION, {
          text: 'Request submitted.',
          isError: false,
          data: payload,
        })
      })
      .catch((e: ApiResponseError) => {
        if (this._settings.respondAs === Responses.Direct) throw new Error(e.message)
        this._errLogger(`Service (collect) got an error. ${e.message}`, e.message)

        return this._responder(EventTypes.SEND_MESSAGE, {
          text: e.message,
          isError: true,
        })
      })
}

export * from './types'
export default Service
