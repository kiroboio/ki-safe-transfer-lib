import { Connect } from './connect'
import {
  Results,
  NetworkItem,
  EventTypes,
  QueryOptions,
  CollectRequest,
  Message,
  Sendable,
  Retrievable,
  Collectable,
  Utxo,
  ExchangeRate,
  RatesProviders,
  GetRatesProps,
  Address,
  Retrieve,
} from './types'
import {
  validateOptions,
  validateObjectWithStrings,
  validateData,
  validateObject,
  validatePropsAddresses,
  validatePropsArray,
  validatePropsString,
  validateRetrieve,
} from './validators'
import { checkOwnerId, flattenAddresses, makeOptions } from './tools'
import { makePropsResponseError, makeReturnError, makeApiResponseError } from './tools/error'
import { shouldReturnDirect } from './tools/connect'
import { isNil, join, assoc, filter } from 'ramda'
import { TEXT } from './data'

class Service extends Connect {

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
  public async getOnlineNetworks(options?: QueryOptions): Promise<Results<NetworkItem[]> | void> {

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
          ...makeOptions(options),
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
  public async collect(request: CollectRequest, options?: QueryOptions): Promise<Results<Message> | void> {

    /** validate props */
    try {
      validateObjectWithStrings(request, 'request', 'collect')

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

  public async send(transaction: Sendable, options?: QueryOptions): Promise<Results<Retrievable> | void> {

    /** validate props */
    try {
      if (isNil(transaction)) throw new Error(TEXT.errors.validation.missingArgument)

      validateObject(transaction, 'transaction')
      validateData(transaction, this._currency, this._network)

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

    let response: Results<Retrievable>

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
  public async getCollectables(addresses: string[], options?: QueryOptions): Promise<Results<Collectable> | void> {

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
        query: { to: addresses.join(';') },
      })
    } catch (err) {

      /** log error */
      this._logApiError('Service (getCollectables) caught [request] error.', err)

      /** throw error */
      throw makeApiResponseError(err)
    }

    /** cache addresses */
    this._lastAddresses = addresses

    try {

      /** return the results */
      if (shouldReturnDirect(options, this._respondAs)) return response

      this._useEventBus(EventTypes.GET_COLLECTABLES, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }
  }

  // TODO: add desc
  public async getUtxos(addresses: string[], options?: QueryOptions): Promise<Results<Utxo> | void> {

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
        query: { address: join(';', addresses), ...makeOptions(options) },
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

  public async getUsed(addresses: string[], options?: QueryOptions): Promise<Results<string[]> | void> {

    /** validate props */
    try {
      validatePropsArray(addresses, 'string', 'addresses', 'getUsed')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getUtxos')
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
          ...makeOptions(options),
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
  public async getFresh(addresses: string[], options?: QueryOptions): Promise<Results<string[]> | void> {

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
        query: { address: join(';', addresses), ...makeOptions(options) },
      })
    } catch (err) {

      /** log error */
      this._logApiError('Service (getUtxos) caught [request] error.', err.message)

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
  public async getByOwnerId(ownerId: string, options?: QueryOptions): Promise<Results<unknown> | void> {

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

    let response

    /** make request */
    try {
      response = await this._transfers.find({
        query: {
          owner: ownerId,
          ...makeOptions(options),
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

  // get retrievable by ID
  public async getRetrievable(id: string, options?: QueryOptions): Promise<Results<Retrievable> | void> {

    /** validate props */
    try {
      validatePropsString(id, 'ownerId', 'getRetrievable')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getRetrievable')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (getRetrievable) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Results<Retrievable>

    /** make request */
    try {
      response = await this._transfers.get(id)
    } catch (err) {

      /** log error */
      this._logApiError('Service (getRetrievable) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(err)
    }

    try {

      /** return the results */
      if (shouldReturnDirect(options, this._respondAs)) return response

      this._useEventBus(EventTypes.GET_RETRIEVABLE, response)
    } catch (err) {
      throw makeReturnError(err.message, err)
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
  public async getRetrievables(ids: string[], options?: QueryOptions): Promise<Results<Retrievable[]> | void> {

    /** validate props */
    try {
      validatePropsArray(ids, 'string', 'ids', 'getRetrievables')

      /** validate options, if present */
      if (options) {
        validateOptions(options, 'getRetrievables')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (getRetrievables) caught [validation] error.', err.message)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Results<Retrievable[]>

    /** make request */
    try {
      response = await this._transfers.find({
        query: { id: ids.join(';'), ...makeOptions(options) },
      })
    } catch (err) {

      /** log error */
      this._logApiError('Service (getRetrievables) caught [request] error.', err.message)

      /** throw error */
      throw makeApiResponseError(err)
    }

    try {

      /** return the results */
      if (shouldReturnDirect(options, this._respondAs)) return response

      this._useEventBus(EventTypes.GET_RETRIEVABLES, response)
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
  public async getRates(options?: QueryOptions): Promise<Results<ExchangeRate[]> | void> {

    /** validate options, if present */
    try {
      if (options) {
        validateOptions(options, 'getRates')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (getRates) caught [validation] error.', err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    /** make request */
    let response: Results<ExchangeRate[]>

    try {
      response = await this._rateBtcToUsd.find({})
    } catch (err) {
      throw makeReturnError(err.message, err)
    }

    /** return results */
    if (shouldReturnDirect(options, this._respondAs)) return response

    this._useEventBus(EventTypes.GET_BTC_TO_USD_RATES, response)
  }

  /**
   * Function to get all available rate for BTC/USD pair
   *
   * @param [Object] GetRatesProps
   * @param [RatesProviders] [GetRatesProps.provide] - optional provider to get data
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
   * service.getRate({provider: RatesProviders.COINGECKO })
   * ```
   * -
   */
  public async getRate(props?: GetRatesProps): Promise<ExchangeRate | void> {
    if (props) {
      const { provider, options } = props

      /** validate props */
      try {
        if (provider) validatePropsString(provider, 'Provider', 'getRate')

        /** validate options, if present */
        if (options) {
          validateOptions(options, 'getRate')
        }
      } catch (err) {

        /** log error */
        this._logError('Service (getRate) caught [validation] error.', err)

        /** throw appropriate error */
        throw makePropsResponseError(err)
      }
    }

    let response: ExchangeRate

    /** make request */
    try {
      response = await this._rateBtcToUsd.get(props?.provider ?? RatesProviders.BITFINEX)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }

    /** return results */

    if (shouldReturnDirect(props?.options, this._respondAs)) return response

    this._useEventBus(EventTypes.GET_BTC_TO_USD_RATE, response)
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
    data: Retrieve,
    options?: Omit<QueryOptions, 'limit' | 'skip'>,
  ): Promise<Results<unknown> | void> {
    this._logTechnical('Service (retrieve) is running.')

    /** validate props */
    try {
      this._logTechnical('Service (retrieve) checking the props...')

      if (isNil(data)) throw new Error(TEXT.errors.validation.missingArgument)

      validateObject(data, 'data')
      validateRetrieve(data, 'data', 'retrieve')

      /** validate options, if present */
      if (options) {
        this._logTechnical('Service (retrieve) found options and checking it...')
        validateOptions(options, 'retrieve')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (retrieve) caught [validation] error.', err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Results<Retrievable>

    /** make request */
    try {
      this._logTechnical('Service (retrieve) requesting service.')
      response = await this._retrieve.create(data)
    } catch (err) {

      /** log error */
      this._logApiError('Service (retrieve) caught [request] error.', err)

      /** throw appropriate error */
      throw makeApiResponseError(err)
    }

    this._logTechnical('Service (retrieve) proceeding with response...')

    /** return the results */
    if (shouldReturnDirect(options, this._respondAs)) return response

    this._useEventBus(EventTypes.RETRIEVE, response)
  }
}

export { Service }
