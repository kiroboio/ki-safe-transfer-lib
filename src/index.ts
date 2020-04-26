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
  Results,
  Utxo,
  QueryOptions,
  Address,
  Currencies,
  Networks,
} from './types'
import { makeStringFromTemplate, checkOwnerId, generateId, makeOptions, flattenAddresses } from './tools'
import {
  validateAddress,
  validateData,
  validateObject,
  validateSettings,
  validateAuthDetails,
  validateArray,
  validateOptions,
} from './validators'
import { TEXT } from './data'
import { Logger } from './logger'
import { isNullOrUndefined } from 'util'
import { join, isNil, map, filter, assoc } from 'ramda'

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

  private _utxos: ApiService

  private _exists: ApiService

  private _lastAddresses: string[] = [] // caching last addresses request

  private _switch: (config: Switch) => boolean | void

  private _isTest = process.env.NODE_ENV === 'test'

  constructor(settings: ServiceProps) {
    this._validateProps(settings)

    const { debug, currency, network, respondAs, eventBus, authDetails } = settings

    if (eventBus) this._eventBus = eventBus

    this._logger = new Logger({ debug: debug ? debug : DebugLevels.MUTE })

    // store settings
    this._settings = {
      version: 'v1',
      debug: debug ?? DebugLevels.MUTE,
      currency: currency ?? Currencies.Bitcoin,
      network: network ?? Networks.Testnet,
      respondAs: respondAs || Responses.Direct,
    }

    const config = new Config({
      debug,
      currency,
      network,
      authDetails,
      logger: this._logger,
      getStatus: this.getStatus,
      refreshInbox: this._refreshInbox,
    })

    this._settings = assoc('version', config.getSettings().version, this._settings)

    this._switch = config.switch

    // set services
    this._networks = config.getService(Endpoints.Networks)
    this._transfers = config.getService(Endpoints.Transfers)
    this._inbox = config.getService(Endpoints.Inbox)
    this._collect = config.getService(Endpoints.Collect)
    this._utxos = config.getService(Endpoints.Utxos)
    this._exists = config.getService(Endpoints.Exists)

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

  private _validateProps(settings: unknown): void {
    try {
      validateSettings(settings)
      validateAuthDetails((settings as ServiceProps).authDetails)
    } catch (e) {
      if (!this._isTest)
        new Logger({ debug: DebugLevels.MUTE }).error(`Service (validateProps) got an error. ${e.message}`)

      throw new TypeError(e.message)
    }
  }

  /**
   * Function to select respond method according to the settings and respond
   * with type (if needed) and payload provided
   *
   * @private
   * @function
   * @name _responder
   * @param T - type of payload
   * @param [EventTypes] type - type of event - string which will be sent
   * through eventBus
   * @param [T] payload - payload to be either returned (if in _Direct_ mode)
   * or sent through eventBus
   *
   * @returns T | void
   *
   * #### Example
   *
   * ```typescript
   * this._responder<Results<Utxo>>(EventTypes.GET_UTXOS, payload)
   * ```
   * _
   */
  private _responder<T>(type: EventTypes, payload: T): T | void {
    if (this._settings.respondAs === Responses.Direct) return payload

    // calling provided function as eventBus might result in error
    try {
      if (this._settings.respondAs === Responses.Callback) this._eventBus({ type, payload })
    } catch (e) {
      this._logger.error(`eventBus got an error. ${e}`)
    }
  }

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

  /**
   * Function to get current status from API - if API is online, block height,
   * average fee for the previous block
   *
   * @returns Promise - promise can contain results,if in _Direct_ mode -
   * array of strings. If in _Callback_ mode, the function returns void
   * in Promise
   *
   * #### Example
   *
   * ```typescript
   * service.getStatus()
   * ```
   *
   * -
   */
  public getStatus = async (): Promise<Status | void>=> {
    try {
        const response: NetworkTip = await this._networks.get(this._settings.network)

        const payload: Status = {
          height: response.height,
          online: response.online,
          fee: response.fee,
        }

        this._logger.info('Service (getStatus): ', payload)
        return this._responder(EventTypes.UPDATE_STATUS, payload)
    } catch (err) {

      if (this._settings.respondAs === Responses.Direct) throw new Error(err.message)

      this._logger.error('Service (getStatus) got an error.', err.message)
      return undefined
    }
  }

  public async getUtxos(addresses: string[], options?: QueryOptions): Promise<Results<Utxo> | void> {
    try {
      if (isNil(addresses)) throw new TypeError(TEXT.errors.validation.missingArgument)

      if (!validateArray(addresses, ['string'])) throw new TypeError(TEXT.errors.validation.typeOfObject)

      if (options) {
        validateObject(options)
        validateOptions(options)
      }

      const payload = await this._utxos.find({
        query: { address: join(';', addresses), ...makeOptions(options) },
      })

      return this._responder<Results<Utxo>>(EventTypes.GET_UTXOS, payload)
    } catch (err) {
      this._logger.error('Service (getUtxos) caught error.', err.message)
      throw err instanceof TypeError ? new TypeError(err.message) : new Error(err.message)
    }
  }

  public async getUsed(addresses: string[], options?: QueryOptions): Promise<Results<string[]> | void> {
    try {
      if (isNil(addresses)) throw new TypeError(TEXT.errors.validation.missingArgument)

      if (!validateArray(addresses, ['string'])) throw new TypeError(TEXT.errors.validation.typeOfObject)

      /** validate options, if present */
      if (options) {
        validateObject(options)
        validateOptions(options)
      }

      const payload = await this._exists.find({
        query: { address: join(';', addresses), ...makeOptions(options) },
      })

      const usedAddresses = flattenAddresses(payload.data as Address[])

      return this._responder<Results<string[]>>(EventTypes.GET_USED, assoc('data', usedAddresses, payload))
    } catch (err) {
      this._logger.error('Service (getUsed) caught error.', err.message)
      throw err instanceof TypeError ? new TypeError(err.message) : new Error(err.message)
    }
  }

  /**
   * Function to check the array of addresses to find the fresh (not used)
   * ones.
   *
   * @param [Array] addresses - array of addresses (string format)
   * @param [QueryOptions] [options] - optional paging options to modify
   * the default ones
   *
   * @returns Promise - promise can contain results,if in _Direct_ mode -
   * array of strings. If in _Callback_ mode, the function returns void
   * in Promise
   *
   * #### Example
   *
   * ```typescript
   * service.getFresh(['xxxx', 'yyyy', 'zzzz'])
   * ```
   *
   * -
   */
  public async getFresh(addresses: string[], options?: QueryOptions): Promise<Results<string[]> | void> {
    try {

      /** throw error if main argument is _null_ or _undefined_ */
      if (isNil(addresses)) throw new TypeError(TEXT.errors.validation.missingArgument)

      /** validate main argument */
      if (!validateArray(addresses, ['string'])) throw new TypeError(TEXT.errors.validation.typeOfObject)

      /** validate options, if present */
      if (options) {
        validateObject(options)
        validateOptions(options)
      }

      /** request data from service */
      const payload = await this._exists.find({
        query: { address: join(';', addresses), ...makeOptions(options) },
      })

      /** flatten the results */
      const usedAddresses = flattenAddresses(payload.data as Address[])

      /** filter out used ones */
      const filterFn = (address: string): boolean => !usedAddresses.includes(address)

      const freshAddresses = filter(filterFn, addresses)

      /** return the results */
      return this._responder<Results<string[]>>(EventTypes.GET_FRESH, assoc('data', freshAddresses, payload))
    } catch (err) {

      /** log error */
      this._logger.error('Service (getFresh) caught error.', err.message)

      /** throw appropriate error */
      throw err instanceof TypeError ? new TypeError(err.message) : new Error(err.message)
    }
  }

  // get retrievable by ID
  public async getRetrievable(id: string): Promise<Retrievable | void> {
    try {
      // validate props
      if (!id) throw new TypeError(TEXT.errors.validation.missingArgument)

      if (typeof id !== 'string') throw new TypeError(TEXT.errors.validation.typeOfObject)

      const payload: Retrievable = await this._transfers.get(id)

      this._logger.info('Service (getRetrievable): ', payload)
      return this._responder<Retrievable>(EventTypes.GET_RETRIEVABLE, payload)
    } catch (err) {
      this._logger.error('Service (getRetrievable) got an error.', err.message)
      throw err instanceof TypeError ? new TypeError(err.message) : new Error(err.message)
    }
  }

  /**
   * Function to get the retrievables transfers for the array of transaction ids.
   *
   * @param [Array] ids - array of ids (string format)
   * @param [QueryOptions] [options] - optional paging options to modify
   * the default ones
   *
   * @returns Promise - promise can contain results,if in _Direct_ mode -
   * array of transaction. If in _Callback_ mode, the function returns void
   * in Promise
   *
   * #### Example
   *
   * ```typescript
   * service.getRetrievables(['xxxx', 'yyyy', 'zzzz'], { limit: 10, skip: 0 })
   * ```
   *
   * -
   */
  public async getRetrievables(ids: string[], options?: QueryOptions): Promise<Retrievable[] | void> {
    try {

      /** throw error if main argument is _null_ or _undefined_ */
      if (isNil(ids)) throw new TypeError(TEXT.errors.validation.missingArgument)

      /** validate main argument */
      if (!validateArray(ids, ['string'])) throw new TypeError(TEXT.errors.validation.typeOfObject)

      /** validate options, if present */
      if (options) {
        validateObject(options)
        validateOptions(options)
      }

      /** request data from service */
      const payload: Retrievable[] = await this._transfers.find({
        query: { id: ids.join(';'), ...makeOptions(options) },
      })

      this._logger.info('Service (getRetrievables): ', payload)

      /** return the results */
      return this._responder<Retrievable[]>(EventTypes.GET_RETRIEVABLES, payload)
    } catch (err) {

      /** log error */
      this._logger.error('Service (getRetrievables) got an error.', err.message)

      /** throw appropriate error */
      throw err instanceof TypeError ? new TypeError(err.message) : new Error(err.message)
    }
  }

  // get all collectables by recipient address
  public async getCollectables(addresses: string[]): Promise<Collectable[] | void> {
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
    } catch (err) {
      this._logger.error('Service (getCollectables) got an error.', err.message)
      throw err instanceof TypeError ? new TypeError(err.message) : new Error(err.message)
    }
  }

  // send retrievable/collectable transaction
  public async send(transaction: Sendable): Promise<Retrievable | void> {
    try {
      // validate props
      if (isNullOrUndefined(transaction)) throw new Error(TEXT.errors.validation.missingArgument)

      validateObject(transaction)
      validateData(transaction, this._settings.currency, this._settings.network)

      const payload = await this._transfers.create(checkOwnerId(transaction))

      return this._responder<Retrievable>(EventTypes.SEND_TRANSACTION, payload)
    } catch (err) {
      this._logger.error('Service (send) got an error.', err.message)
      throw err instanceof TypeError ? new TypeError(err.message) : new Error(err.message)
    }
  }

  // collect transaction
  public collect(request: CollectRequest): Promise<Message | void> {
    return this._collect
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
  }

  // connection
  public connect(props: Switch): boolean | Message | void {
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

export { Service, validateAddress, generateId }
