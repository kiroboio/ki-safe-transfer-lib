import { Connect } from './connect'
import {
  Results,
  NetworkItem,
  EventTypes,
  QueryOptions,
  CollectRequest,
  Message,
  Retrievable,
  Collectable,
  Utxo,
  ExchangeRate,
  GetRatesProps,
  Address,
  SendRequest,
  Transfer,
  RetrieveRequest,
  RequestOptions,
  ConnectProps,
  RatesSources,
  RawTransaction,
  Currencies,
  KiroState,
  KiroPrice,
  EstimateFeeRequest,
  AnyValue,
  Maybe,
  Balance,
} from './types'
import {
  validateOptions,
  validateObjectWithStrings,
  validateSend,
  validateObject,
  validatePropsAddresses,
  validatePropsArray,
  validatePropsString,
  validateRetrieve,
  validateAddress,
  validateEstimateFeesRequest,
} from './validators'
import {
  checkOwnerId,
  flattenAddresses,
  makeOptions,
  makeString,
  makePropsResponseError,
  makeReturnError,
  makeApiResponseError,
  shouldReturnDirect,
  changeType,
} from './tools'
import { isNil, join, assoc, filter, isEmpty } from 'ramda'
import { TEXT, SEND_DATA_SPEC } from './data'
import { ERRORS, MESSAGES } from './text'

class Service extends Connect {
  private static instance: Service

  public static getInstance(props?: ConnectProps, replace = false, url?: string): Service {
    if (replace) {
      this.destroy()
    }

    if (!Service.instance) {
      Service.instance = new Service(props as ConnectProps, url)
    } else if (props) {
      throw TypeError('Library already initiated: props should be null or undefined')
    }

    return Service.instance
  }

  public static destroy(): void {
    if (Service.instance) Service.instance._destroySocket()

    delete changeType<AnyValue>(Service)?.instance
  }

  private constructor(props: ConnectProps, url?: string) {
    super(props, url)
  }

  /**
   * Function to get the list of networks with online status for the API
   *
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
   * service.getOnlineNetworks()
   * ```
   * -
   */
  public async getOnlineNetworks(options?: QueryOptions): Promise<Maybe<Results<NetworkItem[]>>> {

    /** validate options, if present */
    try {
      if (options) {
        validateOptions(options, 'getOnlineNetworks')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (getOnlineNetworks) caught [validation] error.', err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Results<NetworkItem[]>

    /** make request */
    try {
      response = await this._networks.find({
        query: {
          online: true,
          ...makeOptions(options, this._watch),
        },
      })
    } catch (err) {
      throw makeReturnError(err.message, err)
    }

    /** return results */

    if (shouldReturnDirect(options, this._respondAs)) return response

    this._useEventBus(EventTypes.GET_ONLINE_NETWORKS, response)
  }

  // TODO:  add description
  // TODO: check the return object
  public async collect(
    request: CollectRequest,
    options?: Omit<QueryOptions, 'limit' | 'skip'>,
  ): Promise<Maybe<Results<Message>>> {

    /** validate props */
    try {
      validateObjectWithStrings(changeType<Record<string, unknown>>(request), 'request', 'collect')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'collect')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (collect) caught [validation] error.', err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response

    /** make request */
    try {
      response = await this._collect.create({ ...request })
    } catch (err) {

      /** log error */
      this._logApiError('Service (collect) caught [request] error.', err)

      /** throw error */
      throw makeApiResponseError(err)
    }

    try {
      if (shouldReturnDirect(options, this._respondAs)) return response

      this._useEventBus(EventTypes.COLLECT_TRANSACTION, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  // TODO: add desc
  public async send(transaction: SendRequest, options?: QueryOptions): Promise<Maybe<Transfer>> {

    /** validate props */
    try {
      if (isNil(transaction) || isEmpty(transaction)) throw new Error(TEXT.errors.validation.missingArgument)

      validateObject(transaction, 'transaction')

      // validate address
      if (!validateAddress({ address: transaction.to, currency: this._currency, networkType: this._network }))
        throw new TypeError('Invalid address in "to".')

      validateSend(transaction, SEND_DATA_SPEC, 'send')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'send')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (collect) caught [validation] error.', err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Transfer

    /** make request */
    try {
      response = await this._transfers.create(checkOwnerId(transaction))
    } catch (err) {

      /** log error */
      this._logApiError('Service (collect) caught [request] error.', err)

      /** throw appropriate error */
      throw makeApiResponseError(err)
    }

    /** return the results */
    if (shouldReturnDirect(options, this._respondAs)) return response

    this._useEventBus(EventTypes.SEND_TRANSACTION, response)
  }

  // get all collectables by recipient address
  public async getCollectables(addresses: string[], options?: QueryOptions): Promise<Maybe<Results<Collectable>>> {

    /** validate props */
    try {
      validatePropsAddresses(addresses, 'addresses', 'getCollectables', this.getSettings())

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getCollectables')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (getCollectables) caught [validation] error.', err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Results<Collectable>

    /** make request */
    try {
      response = await this._inbox.find({
        query: { to: addresses.join(';'), ...makeOptions(options, this._watch) },
      })
    } catch (err) {

      /** log error */
      this._logApiError('Service (getCollectables) caught [request] error.', err)

      /** throw error */
      throw makeApiResponseError(err)
    }

    /** cache addresses */
    this._lastAddresses = { addresses, options }

    try {

      /** return the results */
      if (shouldReturnDirect(options, this._respondAs)) return response

      this._useEventBus(EventTypes.GET_COLLECTABLES, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  // TODO: add desc
  // TODO: add test
  public async getRawTransaction(
    txid: string,
    options?: Omit<QueryOptions, 'limit' | 'skip' | 'watch'>,
  ): Promise<Maybe<Results<RawTransaction[]>>> {

    /** validate props */
    try {
      if (isNil(txid))
        throw new TypeError(makeString(ERRORS.validation.missingArgument, ['txid', '', 'getRawTransaction']))

      if (typeof txid !== 'string')
        throw new TypeError(
          makeString(ERRORS.validation.wrongTypeArgument, ['txid', 'getRawTransaction', typeof txid, 'string']),
        )

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getRawTransaction')
      }
    } catch (err) {

      /** log error */
      this._logError(makeString(ERRORS.service.gotError, ['getRawTransaction', 'validation']), err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    /** make request */
    let response: Results<RawTransaction[]>

    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getRawTransaction']))

      response = await this._transactions.get(txid)

      this._log(makeString(MESSAGES.technical.gotResponse, ['getRawTransaction']), response)
    } catch (err) {
      this._logApiError(makeString(ERRORS.service.gotError, ['getRawTransaction', 'request']), err)
      throw makeReturnError(err.message, err)
    }

    /** return results */

    try {
      this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getRawTransaction', 'return']))

      if (shouldReturnDirect(options, this._respondAs)) return response

      this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getRawTransaction']))
      this._useEventBus(EventTypes.GET_RAW_TRANSACTIONS, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  // TODO: add desc
  // TODO: add test
  public async getRawTransactions(
    txids: string[],
    options?: Omit<QueryOptions, 'watch'>,
  ): Promise<Maybe<Results<RawTransaction[]>>> {

    /** validate props */
    try {
      validatePropsArray(txids, 'string', 'txids', 'getRawTransactions')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getRawTransactions')
      }
    } catch (err) {

      /** log error */
      this._logError(makeString(ERRORS.service.gotError, ['getRawTransactions', 'validation']), err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    /** make request */
    let response: Results<RawTransaction[]>

    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getRawTransactions']))

      response = await this._transactions.find({
        query: {
          txid: join(';', txids),
          ...makeOptions(options, this._watch),
        },
      })

      this._log(makeString(MESSAGES.technical.gotResponse, ['getRawTransactions']), response)
    } catch (err) {
      this._logApiError(makeString(ERRORS.service.gotError, ['getRawTransactions', 'request']), err)
      throw makeReturnError(err.message, err)
    }

    /** return results */

    try {
      this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getRawTransactions', 'return']))

      if (shouldReturnDirect(options, this._respondAs)) return response

      this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getRawTransactions']))
      this._useEventBus(EventTypes.GET_RAW_TRANSACTIONS, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  // TODO: add desc
  public async getUtxos(addresses: string[], options?: Omit<QueryOptions, 'watch'>): Promise<Maybe<Results<Utxo>>> {

    /** validate props */
    try {
      validatePropsArray(addresses, 'string', 'addresses', 'getUtxos')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getUtxos')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (getUtxos) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response

    /** make request */
    try {
      response = await this._utxos.find({
        query: { address: join(';', addresses), ...makeOptions(options, this._watch) },
      })
    } catch (err) {

      /** log error */
      this._logApiError('Service (getUtxos) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(err)
    }

    try {

      /** return the results */
      if (shouldReturnDirect(options, this._respondAs)) return response

      this._useEventBus(EventTypes.GET_UTXOS, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  public async getUsed(addresses: string[], options?: Omit<QueryOptions, 'watch'>): Promise<Maybe<Results<string[]>>> {

    /** validate props */
    try {
      validatePropsArray(addresses, 'string', 'addresses', 'getUsed')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getUsed')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (getUsed) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response

    /** make request */
    try {
      response = await this._exists.find({
        query: {
          address: join(';', addresses),
          ...makeOptions(options, this._watch),
        },
      })
    } catch (err) {

      /** log error */
      this._logApiError('Service (getUsed) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(err)
    }

    try {

      /** return the results */
      const usedAddresses = flattenAddresses(response.data as Address[])

      /** return the results */
      if (shouldReturnDirect(options, this._respondAs)) return assoc('data', usedAddresses, response)

      this._useEventBus(EventTypes.GET_USED, assoc('data', usedAddresses, response))
    } catch (err) {
      throw makeReturnError(err.message, err)
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
  public async getFresh(addresses: string[], options?: Omit<QueryOptions, 'watch'>): Promise<Maybe<Results<string[]>>> {

    /** validate props */
    try {
      validatePropsArray(addresses, 'string', 'addresses', 'getFresh')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getFresh')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (getFresh) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response

    /** make request */
    try {
      response = await this._exists.find({
        query: { address: join(';', addresses), ...makeOptions(options, this._watch) },
      })
    } catch (err) {

      /** log error */
      this._logApiError('Service (getFresh) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(err)
    }

    try {

      /** flatten the results */
      const usedAddresses = flattenAddresses(response.data as Address[])

      /** filter out used ones */
      const filterFn = (address: string): boolean => !usedAddresses.includes(address)

      const freshAddresses = filter(filterFn, addresses)

      /** return the results */
      if (shouldReturnDirect(options, this._respondAs)) return assoc('data', freshAddresses, response)

      this._useEventBus(EventTypes.GET_FRESH, assoc('data', freshAddresses, response))
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  /**
   * Function to request data using the 'ownerId' set before, when sending safe transfer
   *
   * @param [String] id - owner ID
   * @param [QueryOptions] [options] - options set (paging & etc.)
   *
   * @returns Promise | void
   *
   *
   */
  public async getByOwnerId(ownerId: string, options?: QueryOptions): Promise<Maybe<Results<Retrievable>>> {

    /** validate props */
    try {
      validatePropsString(ownerId, 'ownerId', 'getOwnerById')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getOwnerById')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (getOwnerById) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Results<Retrievable>

    /** make request */
    try {
      response = await this._transfers.find({
        query: {
          owner: ownerId,
          ...makeOptions(options, this._watch),
        },
      })
    } catch (err) {

      /** log error */
      this._logApiError('Service (getOwnerById) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(err)
    }

    try {

      /** return the results */
      if (shouldReturnDirect(options, this._respondAs)) return response

      this._useEventBus(EventTypes.GET_BY_OWNER_ID, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  /**
   * Function to get all available rate for BTC/USD pair
   *
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
   * service.getRates()
   * ```
   * -
   */
  public async getRates(options?: QueryOptions): Promise<Maybe<Results<ExchangeRate[]>>> {
    this._logTechnical(makeString(MESSAGES.technical.running, ['getRates']))

    /** validate options, if present */
    try {
      if (options) {
        this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getRates', 'options']))
        validateOptions(options, 'getRates')
      }
    } catch (err) {

      /** log error */
      this._logError(makeString(ERRORS.service.gotError, ['getRates', 'validation']), err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    /** make request */
    let response: Results<ExchangeRate[]>

    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getRates']))

      response = await this._rateBtcToUsd.find({ query: { ...makeOptions(options, this._watch) } })

      this._log(makeString(MESSAGES.technical.gotResponse, ['getRates']), response)
    } catch (err) {
      this._logApiError(makeString(ERRORS.service.gotError, ['getRates', 'request']), err)
      throw makeReturnError(err.message, err)
    }

    /** return results */

    this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getRate', 'return']))

    if (shouldReturnDirect(options, this._respondAs)) return response

    this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getRates']))
    this._useEventBus(
      this._currency === Currencies.Bitcoin ? EventTypes.GET_BTC_TO_USD_RATES : EventTypes.GET_ETH_TO_USD_RATES,
      response,
    )
  }

  /**
   * Function to get all available rate for BTC/USD pair
   *
   * @param [Object] GetRatesProps
   * @param [RatesSources] [GetRatesProps.provide] - optional provider to get data
   * from; default => BITFINEX
   * @param [QueryOptions] [GetRatesProps.options] - optional paging options to modify
   * the default ones
   *
   * @returns Promise - promise can contain results,if in _Direct_ mode -
   * array of strings. If in _Callback_ mode, the function returns void
   * in Promise
   *
   * #### Example
   *
   * ```typescript
   * service.getRate({source: RatesSources.COINGECKO })
   * ```
   * -
   */
  public async getRate(props?: GetRatesProps): Promise<Maybe<ExchangeRate>> {
    this._logTechnical(makeString(MESSAGES.technical.running, ['getRate']))

    if (props) {
      this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getRate', 'props']), props)

      const { source, options } = props

      /** validate props */
      try {
        if (source) validatePropsString(source, 'Source', 'getRate')

        /** validate options, if present */
        if (options) {
          this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getRate', 'options']))
          validateOptions(options, 'getRate', true)
        }
      } catch (err) {

        /** log error */
        this._logError(makeString(ERRORS.service.gotError, ['getRate', 'validation']), err)

        /** throw appropriate error */
        throw makePropsResponseError(err)
      }
    }

    if (!props?.source)
      this._logTechnical(makeString(MESSAGES.technical.requestWithDefault, ['getRate']), RatesSources.BITFINEX)

    let response: Results<ExchangeRate>

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getRate']))

      response = await this._rateBtcToUsd.find({
        query: {
          source: props?.source ?? RatesSources.BITFINEX,
          ...makeOptions(props?.options, this._watch),
        },
      })
      this._log(makeString(MESSAGES.technical.gotResponse, ['getRate']), response)
    } catch (err) {
      this._logApiError(makeString(ERRORS.service.gotError, ['getRate', 'request']), err)
      throw makeReturnError(err.message, err)
    }

    /** return results */

    this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getRate', 'return']))

    if (shouldReturnDirect(props?.options, this._respondAs)) return response.data[0]

    this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getRate']))
    this._useEventBus(
      this._currency === Currencies.Bitcoin ? EventTypes.GET_BTC_TO_USD_RATE : EventTypes.GET_ETH_TO_USD_RATE,
      response.data[0],
    )
  }

  /**
   * Function to request API to retrieve provided transaction
   *
   * @param [Object] data
   * @param [String] data.id - id of the transaction
   * @param [String] data.raw - raw of the signed transaction
   * @param [Object] options
   * @param [Boolean] options.respondDirect - should method respond directly?
   */
  public async retrieve(
    data: RetrieveRequest,
    options?: Omit<RequestOptions, 'watch'>,
  ): Promise<Maybe<Results<unknown>>> {
    this._logTechnical(makeString(MESSAGES.technical.running, ['retrieve']))

    /** validate props */
    try {
      this._logTechnical(makeString(MESSAGES.technical.checkingProps, ['retrieve']))

      if (isNil(data)) throw new Error(TEXT.errors.validation.missingArgument)

      validateObject(data, 'data')
      validateRetrieve(data, 'data', 'retrieve')

      /** validate options, if present */
      if (options) {
        this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['retrieve', 'options']))
        validateOptions(options, 'retrieve')
      }
    } catch (err) {

      /** log error */
      this._logError(makeString(ERRORS.service.gotError, ['retrieve', 'validation']), err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Results<Retrievable>

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['retrieve']))
      response = await this._retrieve.create(data)
      this._log(makeString(MESSAGES.technical.gotResponse, ['retrieve']), response)
    } catch (err) {

      /** log error */
      this._logApiError(makeString(ERRORS.service.gotError, ['retrieve', 'request']), err)

      /** throw appropriate error */
      throw makeApiResponseError(err)
    }

    /** return the results */

    this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['retrieve', 'return']))

    if (shouldReturnDirect(options, this._respondAs)) return response

    this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['retrieve']))
    this._useEventBus(EventTypes.RETRIEVE, response)
  }

  /**
   * Function to request state of KIRO for a certain address
   *
   * @function
   * @name getKiroState
   * @param [String] address - correct address for current network
   * @returns [Promise] KiroState
   * ---
   * Example:
   *
   * ```typescript
   * await service.getKiroState('0x0xxxxxxxxxxxxx')
   * ```
   * will get the following result:
   * ```
   * address: '0x0xxxxxxxxxxxxx',
     balance: '0',
     debt: '0',
     externalBalance: '0',
     nonce: '0x0000000000000000000000000000000000000000000000000000000000000000',
     pending: '0',
     releaseBlock: '0',
     secretHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
     withdrawal: '0'
   * ```
   *
   *
   */
  public async getKiroState(address: string, options?: Omit<RequestOptions, 'watch'>): Promise<Maybe<KiroState>> {
    this._logTechnical(makeString(MESSAGES.technical.running, ['getKiroState']))

    /** validate props */
    try {
      this._logTechnical(makeString(MESSAGES.technical.checkingProps, ['getKiroState']))

      if (isNil(address)) throw new Error(TEXT.errors.validation.missingArgument)

      validateAddress({ address, currency: Currencies.Ethereum, networkType: this._network })

      /** validate options, if present */
      if (options) {
        this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getKiroState', 'options']))
        validateOptions(options, 'getKiroState')
      }
    } catch (err) {

      /** log error */
      this._logError(makeString(ERRORS.service.gotError, ['getKiroState', 'validation']), err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: KiroState

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getKiroState']))
      response = await this._kiroState.get(address)
      this._log(makeString(MESSAGES.technical.gotResponse, ['getKiroState']), response)
    } catch (err) {

      /** log error */
      this._logApiError(makeString(ERRORS.service.gotError, ['getKiroState', 'request']), err)

      /** throw appropriate error */
      throw makeApiResponseError(err)
    }

    /** return the results */
    this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getKiroState', 'return']))

    if (shouldReturnDirect(options, this._respondAs)) return response

    this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getKiroState']))
    this._useEventBus(EventTypes.GET_KIRO_STATE, response)
  }

  /**
   * Function to provide KIRO price
   *
   * @function
   * @name getKiroPrice
   * @param [String] address - recipient's address
   * @return [Object] KiroPrice
   * ---
   * Example:
   * ```typescript
   * await service.getKiroPrice('0x0xxxxxxxxx')
   * ```
   * will get the following result:
   * ```
   * {
   *   eth: { address: string; min: string; max: string; price: string }
   *   usd: { min: number; max: number; price: number }
   *   availableAt: string
   *   createdAt: string
   *   expiresAt: string
   *   recipient: string
   *   }
   * ```
   */
  public async getKiroPrice(address: string, options?: Omit<RequestOptions, 'watch'>): Promise<Maybe<KiroPrice>> {
    this._logTechnical(makeString(MESSAGES.technical.running, ['getKiroPrice']))

    /** validate props */
    try {
      this._logTechnical(makeString(MESSAGES.technical.checkingProps, ['getKiroPrice']))

      if (isNil(address)) throw new Error(TEXT.errors.validation.missingArgument)

      validateAddress({ address, currency: Currencies.Ethereum, networkType: this._network })

      /** validate options, if present */
      if (options) {
        this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getKiroPrice', 'options']))
        validateOptions(options, 'getKiroPrice')
      }
    } catch (err) {

      /** log error */
      this._logError(makeString(ERRORS.service.gotError, ['getKiroPrice', 'validation']), err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: KiroPrice

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getKiroPrice']))

      response = await this._kiroPrice.get(address)
      this._log(makeString(MESSAGES.technical.gotResponse, ['getKiroPrice']), response)
    } catch (err) {

      /** log error */
      this._logApiError(makeString(ERRORS.service.gotError, ['getKiroPrice', 'request']), err)

      /** throw appropriate error */
      throw makeApiResponseError(err)
    }

    /** return the results */
    this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getKiroPrice', 'return']))

    if (shouldReturnDirect(options, this._respondAs)) return response

    this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getKiroPrice']))
    this._useEventBus(EventTypes.GET_KIRO_PRICE, response)
  }

  /**
   * Function to estimate fees for potential transaction
   *
   * @function
   * @name estimateFees
   * @param [Object] request - request object width data for estimation, containing owner ID as owner (string),
   * @param [Object] [options] - respond options
   * to  (string), amount (number)}
   * @returns [Object]
   * ---
   * Example:
   * ```typescript
   * await service.estimateFees({ ownerId: 'xxxx', to: '0x0xxxxx', amount: 100000})
   * ```
   * will get the following result:
   * ```
   *
   * ```
   */
  public async estimateFees(
    request: EstimateFeeRequest,
    options?: Omit<RequestOptions, 'watch'>,
  ): Promise<Maybe<KiroPrice>> {
    this._logTechnical(makeString(MESSAGES.technical.running, ['estimateFees']))

    /** validate props */
    try {
      this._logTechnical(makeString(MESSAGES.technical.checkingProps, ['estimateFees']))

      if (isNil(request)) throw new Error(TEXT.errors.validation.missingArgument)

      validateObject(request, 'request')
      validateEstimateFeesRequest(request, 'request', 'estimateFees')

      /** validate options, if present */
      if (options) {
        this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['estimateFees', 'options']))
        validateOptions(options, 'estimateFees')
      }
    } catch (err) {

      /** log error */
      this._logError(makeString(ERRORS.service.gotError, ['estimateFees', 'validation']), err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: KiroPrice

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['estimateFees']))

      response = await this._estimateFees.find({
        query: {
          owner: request.ownerId,
          to: request.to,
          amount: request.amount,
          ...makeOptions(options, this._watch),
        },
      })

      this._log(makeString(MESSAGES.technical.gotResponse, ['estimateFees']), response)
    } catch (err) {

      /** log error */
      this._logApiError(makeString(ERRORS.service.gotError, ['estimateFees', 'request']), err)

      /** throw appropriate error */
      throw makeApiResponseError(err)
    }

    /** return the results */
    this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['estimateFees', 'return']))

    if (shouldReturnDirect(options, this._respondAs)) return response

    this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['estimateFees']))
    this._useEventBus(EventTypes.GET_KIRO_PRICE, response)
  }

  /**
   * Function to get balance for a provided address
   *
   * @function
   * @name getBalance
   * @param [String] address - valid address for current currency/network
   * @param [Object] [options] - respond option
   * @returns [Object] Balance
   * ---
   * Example:
   * ```typescript
   * await service.getBalance('0x0xxxx')
   * ```
   * will respond with:
   * ```
   * {
   *    address: '0x0xxxx',
   *    balance: '0000000000000000',
   *    transactionCount: 0
   * }
   * ```
   */
  public async getBalance(address: string, options?: Omit<RequestOptions, 'watch'>): Promise<Maybe<Balance>> {
    this._logTechnical(makeString(MESSAGES.technical.running, ['getBalance']))

    /** validate props */
    try {
      this._logTechnical(makeString(MESSAGES.technical.checkingProps, ['getBalance']))

      if (isNil(address)) throw new Error(TEXT.errors.validation.missingArgument)

      validateAddress({ address, currency: Currencies.Ethereum, networkType: this._network })

      /** validate options, if present */
      if (options) {
        this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getBalance', 'options']))
        validateOptions(options, 'getBalance')
      }
    } catch (err) {

      /** log error */
      this._logError(makeString(ERRORS.service.gotError, ['getBalance', 'validation']), err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Balance

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getBalance']))

      response = await this._balance.get(address)
      this._log(makeString(MESSAGES.technical.gotResponse, ['getBalance']), response)
    } catch (err) {

      /** log error */
      this._logApiError(makeString(ERRORS.service.gotError, ['getBalance', 'request']), err)

      /** throw appropriate error */
      throw makeApiResponseError(err)
    }

    /** return the results */
    this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getBalance', 'return']))

    if (shouldReturnDirect(options, this._respondAs)) return response

    this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getBalance']))
    this._useEventBus(EventTypes.GET_KIRO_PRICE, response)
  }
}

export { Service }
