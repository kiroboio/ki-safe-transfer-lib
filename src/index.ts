import { Config } from './config'

import {
  ApiResponseError,
  ApiService,
  Collectable,
  CollectRequest,
  Endpoints,
  EventBus,
  Event,
  EventTypes,
  NetworkTip,
  ResponseCollect,
  ResponseCollectable,
  Responses,
  Retrievable,
  Sendable,
  ServiceProps,
  Settings,
  Status,
  Switch,
  DebugLevels,
  Message,
} from './types'
import { makeStringFromTemplate } from './tools'
import { validateAddress, validateData, validateObject, validateSettings, validateAuthDetails } from './validators'
import { TEXT } from './data'
import { Logger } from './logger'

/**
 * Kirobo Retrievable Transfer library class to provide convenient
 * way to use the service
 * @class
 * @name Service
 */
class Service {
  private _settings: Settings

  private _logger: Logger

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _eventBus: EventBus = (_event: Event) => {
    return
  }

  private _networks: ApiService

  private _transfers: ApiService

  private _inbox: ApiService

  private _collect: ApiService

  private _lastAddresses: string[] = [] // caching last addresses request

  private _switch: (config: Switch) => boolean | void

  private _isTest = process.env.NODE_ENV === 'test'

  constructor(settings: ServiceProps) {
    this._validateProps(settings)

    const { debug, currency, network, respondAs, eventBus, authDetails } = settings

    if (eventBus) this._eventBus = eventBus

    this._logger = new Logger({ debug: debug ? debug : DebugLevels.MUTE })

    const config = new Config({
      debug,
      currency,
      network,
      authDetails,
      logger: this._logger,
      getStatus: this.getStatus,
      refreshInbox: this._refreshInbox,
    })

    // store settings
    this._settings = {
      ...config.getSettings(),
      respondAs: respondAs || Responses.Direct,
    }

    this._switch = config.switch

    // set services
    this._networks = config.getService(Endpoints.Networks)
    this._transfers = config.getService(Endpoints.Transfers)
    this._inbox = config.getService(Endpoints.Inbox)
    this._collect = config.getService(Endpoints.Collect)

    // event listeners

    // status update
    this._networks.on('patched', (data: NetworkTip) => {
      const { height, online, fee } = data

      this._eventBus({
        type: EventTypes.UPDATE_STATUS,
        payload: { height, online, fee },
      })
    })

    // retrievable updated
    this._transfers.on('patched', (payload: Retrievable) => {
      this._eventBus({
        type: EventTypes.UPDATED_RETRIEVABLE,
        payload,
      })
    })

    // collectable removed
    this._transfers.on('removed', (payload: Collectable) => {
      this._eventBus({
        type: EventTypes.REMOVED_RETRIEVABLE,
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

    // collectable patched
    this._inbox.on('patched', (payload: Collectable) => {
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

  private _validateProps = (settings: unknown): void => {
    try {
      validateSettings(settings)
      validateAuthDetails((settings as ServiceProps).authDetails)
    } catch (e) {
      if (!this._isTest) new Logger({debug:DebugLevels.MUTE}).error(`Service (validateProps) got an error. ${e.message}`)

      throw new TypeError(e.message)
    }
  }

  // responder
  private _responder<T>(type: EventTypes, payload: T): T | void {
    if (this._settings.respondAs === Responses.Direct) return payload

    // calling provided function as eventBus might result in error
    try {
      if (this._settings.respondAs === Responses.Callback) this._eventBus({ type, payload })
    } catch (e) {
      this._logger.error(`eventBus got an error. ${e}`)
    }
  }

  private _makeError = (e: TypeError | Error): TypeError | Error =>
    e instanceof TypeError ? new TypeError(e.message) : new Error(e.message)

  private _refreshInbox = (): void => {
    if (this._lastAddresses.length)
      return this._inbox
        .find({ query: { to: this._lastAddresses.join(';') } })
        .then((payload: ResponseCollectable) => {
          this._eventBus({ type: EventTypes.GET_COLLECTABLES, payload: payload.data })
        })
        .catch((e: ApiResponseError) => {
          this._logger.error(`Service (getCollectables) got an error: ${e.message || 'unknown'}`)
        })
  }

  // get last addresses
  public getLastAddresses = (): string[] => this._lastAddresses

  // clear cached addresses
  public clearLastAddresses = (): never[] => (this._lastAddresses = [])

  // show settings
  public getSettings = (): Settings => this._settings

  // get current API status (height and online)
  public getStatus = (): Status | undefined =>
    this._networks
      .get(this._settings.network)
      .then((response: NetworkTip) => {
        const payload: Status = {
          height: response.height,
          online: response.online,
          fee: response.fee,
        }

        this._logger.info('Service (getStatus): ', payload)
        return this._responder(EventTypes.UPDATE_STATUS, payload)
      })
      .catch((e: ApiResponseError) => {
        if (this._settings.respondAs === Responses.Direct) throw new Error(e.message)

        this._logger.error('Service (getStatus) got an error.', e.message)
        return undefined
      })

  // get retrievable by ID
  public getRetrievable = async (id: string): Promise<Retrievable | void> => {
    try {
      // validate props
      if (!id) throw new TypeError(TEXT.errors.validation.missingArgument)

      if (typeof id !== 'string') throw new TypeError(TEXT.errors.validation.typeOfObject)

      const payload: Retrievable = await this._transfers.get(id)

      this._logger.info('Service (getRetrievable): ', payload)
      return this._responder<Retrievable>(EventTypes.GET_RETRIEVABLE, payload)
    } catch (e) {
      if (this._settings.respondAs === Responses.Direct) throw this._makeError(e)

      this._logger.error('Service (getRetrievable) got an error.', e.message)
      return undefined
    }
  }

  // get all collectables by recipient address
  public getCollectables = async (addresses: string[]): Promise<Collectable[] | void> => {
    try {
      // validate props
      if (!addresses) throw new TypeError(TEXT.errors.validation.missingArgument)

      if (!Array.isArray(addresses)) throw new TypeError(TEXT.errors.validation.typeOfObject)

      addresses.forEach(address => {
        if (typeof address !== 'string') throw new TypeError(TEXT.errors.validation.typeOfObject)

        if (
          !validateAddress({
            address,
            currency: this._settings.currency,
            networkType: this._settings.network,
          })
        )
          throw new Error(makeStringFromTemplate(TEXT.errors.validation.malformedAddress, [address]))
      })

      const payload: ResponseCollectable = await this._inbox.find({
        query: { to: addresses.join(';') },
      })

      this._lastAddresses = addresses

      this._logger.info('Service (getCollectables): ', payload.data)

      return this._responder<Collectable[]>(EventTypes.GET_COLLECTABLES, payload.data)
    } catch (e) {
      if (this._settings.respondAs === Responses.Direct) throw this._makeError(e)

      this._logger.error('Service (getCollectables) got an error.', e.message)
    }
  }

  // send retrievable/collectable transaction
  public send = async (transaction: Sendable): Promise<Retrievable | void> => {
    try {
      // validate props
      if (transaction === undefined || transaction === null) throw new Error(TEXT.errors.validation.missingArgument)

      validateObject(transaction)
      validateData(transaction, this._settings.currency, this._settings.network)

      const payload = await this._transfers.create(transaction)

      return this._responder<Retrievable>(EventTypes.SEND_TRANSACTION, payload)
    } catch (e) {
      if (this._settings.respondAs === Responses.Direct) throw this._makeError(e)

      this._logger.error('Service (send) got an error.', e.message)
    }
  }

  // collect transaction
  public collect = (request: CollectRequest): Promise<Message | void> =>
    this._collect
      .create({ ...request })
      .then((payload: ResponseCollect) => {
        this._logger.info('Service (collect): ', payload)

        return this._responder<Message>(EventTypes.COLLECT_TRANSACTION, {
          text: 'Request submitted.',
          isError: false,
          data: payload,
        })
      })
      .catch((e: ApiResponseError) => {
        if (this._settings.respondAs === Responses.Direct) throw new Error(e.message)

        this._logger.error(`Service (collect) got an error. ${e.message}`, e.message)

        return this._responder(EventTypes.SEND_MESSAGE, {
          text: e.message,
          isError: true,
        })
      })

  // connection
  public connect = (props: Switch): boolean | Message | void => {
    try {
      const result = this._switch(props)

      return result
    } catch (e) {
      if (this._settings.respondAs === Responses.Direct) throw new Error(e.message)

      this._logger.error(`Service (switch) got an error. ${e.message}`, e.message)
      return this._responder<Message>(EventTypes.SEND_MESSAGE, {
        text: e.message,
        isError: true,
      })
    }
  }
}

export * from './types'

// eslint-disable-next-line import/no-default-export
export default Service

export { Service, validateAddress }
