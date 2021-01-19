import { Connect } from './connect';
import {
  ConnectProps,
  AnyValue,
  Maybe,
  InstanceOptions,
  QueryOptions,
  Endpoints,
  EventTypes,
  Results,
  BtcNetworkItem,
  EthNetworkItem,
  Either,
  EthTransfer,
  BtcTransfer,
  Currencies,
  CollectRequest,
  Message,
  SendRequest,
  Collectable,
} from './types';
import { checkOwnerId, makeOptions, makeString, Type } from './tools';
import { validateOptions } from './validators/options';
import { ERRORS, MESSAGES } from './text';
import { validateAddress } from './validators/address';
import { isEmpty, isNil } from 'ramda';
import { TEXT } from './data';
import { invalidAddress } from './tools/validation';
import { validateObject, validateObjectWithStrings } from './validators/object';
import { validatePropsAddresses } from './validators/array';

class Service extends Connect {
  private static instance: Service;

  /*
   * Get current instance
   *
   * @return Service
   */
  public static getInstance(): Maybe<Service> {
    return Service.instance;
  }

  /*
   * Create/replace new service instance
   *
   * @params { ConnectProps } props - minimum required parameters
   * @params { InstanceOptions } [options] - optional parameters
   *
   * @return  Service
   */
  public static createInstance(props: ConnectProps, options?: InstanceOptions): Service {
    if (Service.instance) this.destroy();

    Service.instance = new Service(props as ConnectProps, options);

    return Service.instance;
  }

  /*
   * Destroy ws connection
   */
  public static destroy(): void {
    if (Service.instance) Service.instance._destroySocket();

    delete Type<AnyValue>(Service)?.instance;
  }

  /*
   * Constructor to propagate the parameters to parent classes
   *
   * @params { ConnectProps } props - minimum required parameters
   * @params { InstanceOptions } options - optional parameters
   */
  private constructor(props: ConnectProps, options: Maybe<InstanceOptions>) {
    super(props, options);
  }

  // service structure:
  // - validate options -> throw if options invalid
  // - make or get service
  // - make request -> throw on error
  // - save service if needed
  // - return result

  /*
   * Get all networks that are online and available to Kirobo API
   *
   * @params { QueryOptions } [options] - optional parameters
   *
   */
  public async getOnlineNetworks(options?: QueryOptions) {
    this._logTechnical(makeString(MESSAGES.technical.running, ['getOnlineNetworks']));

    /** validate options, if present */
    try {
      if (options) {
        validateOptions(options, 'getOnlineNetworks', true);
      }
    } catch (err) {
      this._processValidationError(err, 'getOnlineNetworks');
    }

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getOnlineNetworks']));

      const currencyNetwork = this.getCurrencyNetwork(options?.currency, options?.network);

      const service = this._retrieveServiceOrMakeNew(currencyNetwork, Endpoints.Networks);

      const response: Results<Either<BtcNetworkItem, EthNetworkItem>[]> = await service.request.find({
        query: {
          online: true,
          ...makeOptions(options, this._watch),
        },
      });

      if (service.isNew) this._storeService(currencyNetwork, Endpoints.Networks, service.request);

      return this._returnResults(options, response, 'getOnlineNetworks', EventTypes.GET_ONLINE_NETWORKS);
    } catch (err) {
      this._processApiError(err, 'getOnlineNetworks');
    }
  }

  /*
   * Get all available Eth transfers
   *
   * @params { String } address - valid Ethereum address
   * @params [ QueryOptions } options - optional parameters
   *
   */
  public async getEthTransfers(address: string, options?: QueryOptions) {
    this._logTechnical(makeString(MESSAGES.technical.running, ['getTransfers']));

    // validate props
    const currencyNetwork = this.getCurrencyNetwork(options?.currency, options?.network);

    if (isNil(address) || isEmpty(address)) throw new Error(TEXT.errors.validation.missingArgument);

    if (currencyNetwork.currency !== Currencies.Ethereum)
      throw new Error(makeString(ERRORS.validation.exclusiveRequest, [Currencies.Ethereum]));

    try {
      // validate address
      if (!validateAddress({ address, currency: currencyNetwork.currency, networkType: currencyNetwork.network }))
        throw new TypeError(invalidAddress(currencyNetwork.currency));

      // validate options, if present
      if (options) {
        validateOptions(options, 'getTransfers');
      }
    } catch (err) {
      this._processValidationError(err, 'getTransfers');
    }

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getTransfers']));

      const service = this._retrieveServiceOrMakeNew(currencyNetwork, Endpoints.Transfers);

      const response: Results<
        typeof currencyNetwork.currency extends Currencies.Ethereum ? EthTransfer : BtcTransfer
      > = await service.request.find({
        query: {
          address,
          ...makeOptions(options, this._watch),
        },
      });

      if (service.isNew) this._storeService(currencyNetwork, Endpoints.Transfers, service.request);

      return this._returnResults(options, response, 'getTransfers', EventTypes.GET_TRANSFERS);
    } catch (err) {
      this._processApiError(err, 'getTransfers');
    }
  }

  /*
   * Collect transaction
   *
   * @params { CollectRequest } request - ID and key of the transaction to collect
   * @params { QueryOptions } options - optional parameters
   *
   */
  public async collect(request: CollectRequest, options?: Omit<QueryOptions, 'limit' | 'skip'>) {
    // validate props
    const currencyNetwork = this.getCurrencyNetwork(options?.currency, options?.network);

    validateObjectWithStrings(Type<Record<string, unknown>>(request), 'request', 'collect');

    try {
      /** validate options, if present */
      if (options) validateOptions(options, 'collect');
    } catch (err) {
      this._processValidationError(err, 'collect');
    }

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['collect']));

      const service = this._retrieveServiceOrMakeNew(currencyNetwork, Endpoints.Collect);

      const response: Results<Message> = await service.request.create({ ...request });

      if (service.isNew) this._storeService(currencyNetwork, Endpoints.Transfers, service.request);

      return this._returnResults(options, response, 'collect', EventTypes.COLLECT_TRANSACTION);
    } catch (err) {
      this._processApiError(err, 'getTransfers');
    }
  }

  /*
   * Send transaction to Kirobo API
   *
   * @params { SendRequest } transaction - transaction details
   * @params { QueryOptions } [ options ] - optional parameters
   *
   */
  public async send(transaction: SendRequest, options?: QueryOptions) {
    const currencyNetwork = this.getCurrencyNetwork(options?.currency, options?.network);

    // validate props
    try {
      if (isNil(transaction) || isEmpty(transaction)) throw new Error(TEXT.errors.validation.missingArgument);

      validateObject(transaction, 'transaction');

      // validate address
      if (
        !validateAddress({
          address: transaction.to,
          currency: currencyNetwork.currency,
          networkType: currencyNetwork.network,
        })
      )
        throw new TypeError('Invalid address in "to".');

      // TODO: update and restore
      // validateSend(transaction, SEND_DATA_SPEC, 'send')

      // validate options, if present
      if (options) validateOptions(options, 'send');
    } catch (err) {
      this._processValidationError(err, 'send');
    }

    // make request
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['send']));

      const service = this._retrieveServiceOrMakeNew(currencyNetwork, Endpoints.Transfers);

      const response: BtcTransfer | EthTransfer = await service.request.create(checkOwnerId(transaction));

      if (service.isNew) this._storeService(currencyNetwork, Endpoints.Transfers, service.request);

      return this._returnResults(options, response, 'send', EventTypes.SEND_TRANSACTION);
    } catch (err) {
      this._processApiError(err, 'send');
    }
  }

  // get all collectables by recipient address
  public async getCollectables(addresses: string[], options?: QueryOptions): Promise<Maybe<Results<Collectable>>> {
    const currencyNetwork = this.getCurrencyNetwork(options?.currency, options?.network);

    try {
      validatePropsAddresses(addresses, 'addresses', 'getCollectables', currencyNetwork);

      if (options) {
        validateOptions(options, 'getCollectables');
      }
    } catch (err) {
      this._processValidationError(err, 'collect');
    }

    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getCollectables']));

      const service = this._retrieveServiceOrMakeNew(currencyNetwork, Endpoints.Inbox);

      const response: Results<Collectable> = await service.request.find({
        query: { to: addresses.join(';'), ...makeOptions(options, this._watch) },
      });

      if (service.isNew) this._storeService(currencyNetwork, Endpoints.Transfers, service.request);

      this._lastAddresses = { addresses, options };

      return this._returnResults(options, response, 'getCollectables', EventTypes.GET_COLLECTABLES);
    } catch (err) {
      this._processApiError(err, 'getCollectables');
    }
  }

  // =====================
  //
  //

  // public async getRawTransaction(
  //   txid: string,
  //   options?: Omit<QueryOptions, 'limit' | 'skip' | 'watch'>,
  // ): Promise<Maybe<Results<RawTransaction[]>>> {
  //
  //   /** validate props */
  //   try {
  //     if (isNil(txid))
  //       throw new TypeError(makeString(ERRORS.validation.missingArgument, ['txid', '', 'getRawTransaction']))
  //
  //     if (typeof txid !== 'string')
  //       throw new TypeError(
  //         makeString(ERRORS.validation.wrongTypeArgument, ['txid', 'getRawTransaction', typeof txid, 'string']),
  //       )
  //
  //     /** validate options, if present */
  //     if (options) {
  //       validateOptions(options, 'getRawTransaction')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError(makeString(ERRORS.service.gotError, ['getRawTransaction', 'validation']), err)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   /** make request */
  //   let response: Results<RawTransaction[]>
  //
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getRawTransaction']))
  //
  //     response = await this._transactions.get(txid)
  //
  //     this._log(makeString(MESSAGES.technical.gotResponse, ['getRawTransaction']), response)
  //   } catch (err) {
  //     this._logApiError(makeString(ERRORS.service.gotError, ['getRawTransaction', 'request']), err)
  //     throw makeReturnError(err.message, err)
  //   }
  //
  //   /** return results */
  //
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getRawTransaction', 'return']))
  //
  //     if (shouldReturnDirect(options, this._respondAs)) return response
  //
  //     this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getRawTransaction']))
  //     this._useEventBus(EventTypes.GET_RAW_TRANSACTIONS, response)
  //   } catch (err) {
  //     throw makeReturnError(err.message, err)
  //   }
  // }

  // TODO: add desc
  // TODO: add test
  // public async getRawTransactions(
  //   txids: string[],
  //   options?: Omit<QueryOptions, 'watch'>,
  // ): Promise<Maybe<Results<RawTransaction[]>>> {
  //
  //   /** validate props */
  //   try {
  //     validatePropsArray(txids, 'string', 'txids', 'getRawTransactions')
  //
  //     /** validate options, if present */
  //     if (options) {
  //       validateOptions(options, 'getRawTransactions')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError(makeString(ERRORS.service.gotError, ['getRawTransactions', 'validation']), err)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   /** make request */
  //   let response: Results<RawTransaction[]>
  //
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getRawTransactions']))
  //
  //     response = await this._transactions.find({
  //       query: {
  //         txid: join(';', txids),
  //         ...makeOptions(options, this._watch),
  //       },
  //     })
  //
  //     this._log(makeString(MESSAGES.technical.gotResponse, ['getRawTransactions']), response)
  //   } catch (err) {
  //     this._logApiError(makeString(ERRORS.service.gotError, ['getRawTransactions', 'request']), err)
  //     throw makeReturnError(err.message, err)
  //   }
  //
  //   /** return results */
  //
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getRawTransactions', 'return']))
  //
  //     if (shouldReturnDirect(options, this._respondAs)) return response
  //
  //     this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getRawTransactions']))
  //     this._useEventBus(EventTypes.GET_RAW_TRANSACTIONS, response)
  //   } catch (err) {
  //     throw makeReturnError(err.message, err)
  //   }
  // }

  // TODO: add desc
  // public async getUtxos(addresses: string[], options?: Omit<QueryOptions, 'watch'>): Promise<Maybe<Results<Utxo>>> {
  //
  //   /** validate props */
  //   try {
  //     validatePropsArray(addresses, 'string', 'addresses', 'getUtxos')
  //
  //     /** validate options, if present */
  //     if (options) {
  //       validateOptions(options, 'getUtxos')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError('Service (getUtxos) caught [validation] error.', err.message)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   let response
  //
  //   /** make request */
  //   try {
  //     response = await this._utxos.find({
  //       query: { address: join(';', addresses), ...makeOptions(options, this._watch) },
  //     })
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logApiError('Service (getUtxos) caught [request] error.', err.message)
  //
  //     /** throw error */
  //     throw makeApiResponseError(err)
  //   }
  //
  //   try {
  //
  //     /** return the results */
  //     if (shouldReturnDirect(options, this._respondAs)) return response
  //
  //     this._useEventBus(EventTypes.GET_UTXOS, response)
  //   } catch (err) {
  //     throw makeReturnError(err.message, err)
  //   }
  // }

  // public async getUsed(addresses: string[], options?: Omit<QueryOptions, 'watch'>): Promise<Maybe<Results<string[]>>> {
  //
  //   /** validate props */
  //   try {
  //     validatePropsArray(addresses, 'string', 'addresses', 'getUsed')
  //
  //     /** validate options, if present */
  //     if (options) {
  //       validateOptions(options, 'getUsed')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError('Service (getUsed) caught [validation] error.', err.message)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   let response
  //
  //   /** make request */
  //   try {
  //     response = await this._exists.find({
  //       query: {
  //         address: join(';', addresses),
  //         ...makeOptions(options, this._watch),
  //       },
  //     })
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logApiError('Service (getUsed) caught [request] error.', err.message)
  //
  //     /** throw error */
  //     throw makeApiResponseError(err)
  //   }
  //
  //   try {
  //
  //     /** return the results */
  //     const usedAddresses = flattenAddresses(response.data as Address[])
  //
  //     /** return the results */
  //     if (shouldReturnDirect(options, this._respondAs)) return assoc('data', usedAddresses, response)
  //
  //     this._useEventBus(EventTypes.GET_USED, assoc('data', usedAddresses, response))
  //   } catch (err) {
  //     throw makeReturnError(err.message, err)
  //   }
  // }

  // public async getFresh(addresses: string[], options?: Omit<QueryOptions, 'watch'>): Promise<Maybe<Results<string[]>>> {
  //
  //   /** validate props */
  //   try {
  //     validatePropsArray(addresses, 'string', 'addresses', 'getFresh')
  //
  //     /** validate options, if present */
  //     if (options) {
  //       validateOptions(options, 'getFresh')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError('Service (getFresh) caught [validation] error.', err.message)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   let response
  //
  //   /** make request */
  //   try {
  //     response = await this._exists.find({
  //       query: { address: join(';', addresses), ...makeOptions(options, this._watch) },
  //     })
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logApiError('Service (getFresh) caught [request] error.', err.message)
  //
  //     /** throw error */
  //     throw makeApiResponseError(err)
  //   }
  //
  //   try {
  //
  //     /** flatten the results */
  //     const usedAddresses = flattenAddresses(response.data as Address[])
  //
  //     /** filter out used ones */
  //     const filterFn = (address: string): boolean => !usedAddresses.includes(address)
  //
  //     const freshAddresses = filter(filterFn, addresses)
  //
  //     /** return the results */
  //     if (shouldReturnDirect(options, this._respondAs)) return assoc('data', freshAddresses, response)
  //
  //     this._useEventBus(EventTypes.GET_FRESH, assoc('data', freshAddresses, response))
  //   } catch (err) {
  //     throw makeReturnError(err.message, err)
  //   }
  // }

  // public async getByOwnerId(ownerId: string, options?: QueryOptions): Promise<Maybe<Results<Retrievable>>> {
  //
  //   /** validate props */
  //   try {
  //     validatePropsString(ownerId, 'ownerId', 'getOwnerById')
  //
  //     /** validate options, if present */
  //     if (options) {
  //       validateOptions(options, 'getOwnerById')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError('Service (getOwnerById) caught [validation] error.', err.message)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   let response: Results<Retrievable>
  //
  //   /** make request */
  //   try {
  //     response = await this._transfers.find({
  //       query: {
  //         owner: ownerId,
  //         ...makeOptions(options, this._watch),
  //       },
  //     })
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logApiError('Service (getOwnerById) caught [request] error.', err.message)
  //
  //     /** throw error */
  //     throw makeApiResponseError(err)
  //   }
  //
  //   try {
  //
  //     /** return the results */
  //     if (shouldReturnDirect(options, this._respondAs)) return response
  //
  //     this._useEventBus(EventTypes.GET_BY_OWNER_ID, response)
  //   } catch (err) {
  //     throw makeReturnError(err.message, err)
  //   }
  // }

  // public async getRates(options?: QueryOptions): Promise<Maybe<Results<ExchangeRate[]>>> {
  //   this._logTechnical(makeString(MESSAGES.technical.running, ['getRates']))
  //
  //   /** validate options, if present */
  //   try {
  //     if (options) {
  //       this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getRates', 'options']))
  //       validateOptions(options, 'getRates')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError(makeString(ERRORS.service.gotError, ['getRates', 'validation']), err)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   /** make request */
  //   let response: Results<ExchangeRate[]>
  //
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getRates']))
  //
  //     response = await this._rateBtcToUsd.find({ query: { ...makeOptions(options, this._watch) } })
  //
  //     this._log(makeString(MESSAGES.technical.gotResponse, ['getRates']), response)
  //   } catch (err) {
  //     this._logApiError(makeString(ERRORS.service.gotError, ['getRates', 'request']), err)
  //     throw makeReturnError(err.message, err)
  //   }
  //
  //   /** return results */
  //
  //   this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getRate', 'return']))
  //
  //   if (shouldReturnDirect(options, this._respondAs)) return response
  //
  //   this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getRates']))
  //   this._useEventBus(
  //     this._currency === Currencies.Bitcoin ? EventTypes.GET_BTC_TO_USD_RATES : EventTypes.GET_ETH_TO_USD_RATES,
  //     response,
  //   )
  // }

  // public async getRate(props?: GetRatesProps): Promise<Maybe<ExchangeRate>> {
  //   this._logTechnical(makeString(MESSAGES.technical.running, ['getRate']))
  //
  //   if (props) {
  //     this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getRate', 'props']), props)
  //
  //     const { source, options } = props
  //
  //     /** validate props */
  //     try {
  //       if (source) validatePropsString(source, 'Source', 'getRate')
  //
  //       /** validate options, if present */
  //       if (options) {
  //         this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getRate', 'options']))
  //         validateOptions(options, 'getRate', true)
  //       }
  //     } catch (err) {
  //
  //       /** log error */
  //       this._logError(makeString(ERRORS.service.gotError, ['getRate', 'validation']), err)
  //
  //       /** throw appropriate error */
  //       throw makePropsResponseError(err)
  //     }
  //   }
  //
  //   if (!props?.source)
  //     this._logTechnical(makeString(MESSAGES.technical.requestWithDefault, ['getRate']), RatesSources.BITFINEX)
  //
  //   let response: Results<ExchangeRate>
  //
  //   /** make request */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getRate']))
  //
  //     response = await this._rateBtcToUsd.find({
  //       query: {
  //         source: props?.source ?? RatesSources.BITFINEX,
  //         ...makeOptions(props?.options, this._watch),
  //       },
  //     })
  //     this._log(makeString(MESSAGES.technical.gotResponse, ['getRate']), response)
  //   } catch (err) {
  //     this._logApiError(makeString(ERRORS.service.gotError, ['getRate', 'request']), err)
  //     throw makeReturnError(err.message, err)
  //   }
  //
  //   /** return results */
  //
  //   this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getRate', 'return']))
  //
  //   if (shouldReturnDirect(props?.options, this._respondAs)) return response.data[0]
  //
  //   this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getRate']))
  //   this._useEventBus(
  //     this._currency === Currencies.Bitcoin ? EventTypes.GET_BTC_TO_USD_RATE : EventTypes.GET_ETH_TO_USD_RATE,
  //     response.data[0],
  //   )
  // }

  // public async retrieve(
  //   data: RetrieveRequest,
  //   options?: Omit<RequestOptions, 'watch'>,
  // ): Promise<Maybe<Results<unknown>>> {
  //   this._logTechnical(makeString(MESSAGES.technical.running, ['retrieve']))
  //
  //   /** validate props */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.checkingProps, ['retrieve']))
  //
  //     if (isNil(data)) throw new Error(TEXT.errors.validation.missingArgument)
  //
  //     validateObject(data, 'data')
  //     validateRetrieve(data, 'data', 'retrieve')
  //
  //     /** validate options, if present */
  //     if (options) {
  //       this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['retrieve', 'options']))
  //       validateOptions(options, 'retrieve')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError(makeString(ERRORS.service.gotError, ['retrieve', 'validation']), err)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   let response: Results<Retrievable>
  //
  //   /** make request */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.requestingData, ['retrieve']))
  //     response = await this._retrieve.create(data)
  //     this._log(makeString(MESSAGES.technical.gotResponse, ['retrieve']), response)
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logApiError(makeString(ERRORS.service.gotError, ['retrieve', 'request']), err)
  //
  //     /** throw appropriate error */
  //     throw makeApiResponseError(err)
  //   }
  //
  //   /** return the results */
  //
  //   this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['retrieve', 'return']))
  //
  //   if (shouldReturnDirect(options, this._respondAs)) return response
  //
  //   this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['retrieve']))
  //   this._useEventBus(EventTypes.RETRIEVE, response)
  // }

  // public async getKiroState(address: string, options?: Omit<RequestOptions, 'watch'>): Promise<Maybe<KiroState>> {
  //   this._logTechnical(makeString(MESSAGES.technical.running, ['getKiroState']))
  //
  //   /** validate props */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.checkingProps, ['getKiroState']))
  //
  //     if (isNil(address)) throw new Error(TEXT.errors.validation.missingArgument)
  //
  //     validateAddress({ address, currency: Currencies.Ethereum, networkType: this._network })
  //
  //     /** validate options, if present */
  //     if (options) {
  //       this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getKiroState', 'options']))
  //       validateOptions(options, 'getKiroState')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError(makeString(ERRORS.service.gotError, ['getKiroState', 'validation']), err)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   let response: KiroState
  //
  //   /** make request */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getKiroState']))
  //     response = await this._kiroState.get(address)
  //     this._log(makeString(MESSAGES.technical.gotResponse, ['getKiroState']), response)
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logApiError(makeString(ERRORS.service.gotError, ['getKiroState', 'request']), err)
  //
  //     /** throw appropriate error */
  //     throw makeApiResponseError(err)
  //   }
  //
  //   /** return the results */
  //   this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getKiroState', 'return']))
  //
  //   if (shouldReturnDirect(options, this._respondAs)) return response
  //
  //   this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getKiroState']))
  //   this._useEventBus(EventTypes.GET_KIRO_STATE, response)
  // }

  // public async getKiroPrice(address: string, options?: Omit<RequestOptions, 'watch'>): Promise<Maybe<KiroPrice>> {
  //   this._logTechnical(makeString(MESSAGES.technical.running, ['getKiroPrice']))
  //
  //   /** validate props */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.checkingProps, ['getKiroPrice']))
  //
  //     if (isNil(address)) throw new Error(TEXT.errors.validation.missingArgument)
  //
  //     validateAddress({ address, currency: Currencies.Ethereum, networkType: this._network })
  //
  //     /** validate options, if present */
  //     if (options) {
  //       this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getKiroPrice', 'options']))
  //       validateOptions(options, 'getKiroPrice')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError(makeString(ERRORS.service.gotError, ['getKiroPrice', 'validation']), err)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   let response: KiroPrice
  //
  //   /** make request */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getKiroPrice']))
  //
  //     response = await this._kiroPrice.get(address)
  //     this._log(makeString(MESSAGES.technical.gotResponse, ['getKiroPrice']), response)
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logApiError(makeString(ERRORS.service.gotError, ['getKiroPrice', 'request']), err)
  //
  //     /** throw appropriate error */
  //     throw makeApiResponseError(err)
  //   }
  //
  //   /** return the results */
  //   this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getKiroPrice', 'return']))
  //
  //   if (shouldReturnDirect(options, this._respondAs)) return response
  //
  //   this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getKiroPrice']))
  //   this._useEventBus(EventTypes.GET_KIRO_PRICE, response)
  // }

  // public async buyKiro(
  //   request: BuyKiroWithEthRequest,
  //   options?: Omit<RequestOptions, 'watch'>,
  // ): Promise<Maybe<KiroPrice>> {
  //   this._logTechnical(makeString(MESSAGES.technical.running, ['buyKiro']))
  //
  //   /** validate props */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.checkingProps, ['buyKiro']))
  //
  //     if (isNil(request)) throw new Error(TEXT.errors.validation.missingArgument)
  //
  //     validateBuyKiroRequest(request, 'request', 'buyKiro')
  //
  //     /** validate options, if present */
  //     if (options) {
  //       this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['buyKiro', 'options']))
  //       validateOptions(options, 'buyKiro')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError(makeString(ERRORS.service.gotError, ['buyKiro', 'validation']), err)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   let response: KiroPrice
  //
  //   /** make request */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.requestingData, ['buyKiro']))
  //
  //     response = await this._kiroBuy.create(request)
  //     this._log(makeString(MESSAGES.technical.gotResponse, ['buyKiro']), response)
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logApiError(makeString(ERRORS.service.gotError, ['buyKiro', 'request']), err)
  //
  //     /** throw appropriate error */
  //     throw makeApiResponseError(err)
  //   }
  //
  //   /** return the results */
  //   this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['buyKiro', 'return']))
  //
  //   if (shouldReturnDirect(options, this._respondAs)) return response
  //
  //   this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['buyKiro']))
  //   this._useEventBus(EventTypes.BUY_KIRO, response)
  // }

  // public async estimateFees(
  //   request: EstimateFeeRequest,
  //   options?: Omit<RequestOptions, 'watch'>,
  // ): Promise<Maybe<EstimatedFee>> {
  //   this._logTechnical(makeString(MESSAGES.technical.running, ['estimateFees']))
  //
  //   /** validate props */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.checkingProps, ['estimateFees']))
  //
  //     if (isNil(request)) throw new Error(TEXT.errors.validation.missingArgument)
  //
  //     validateObject(request, 'request')
  //     validateEstimateFeesRequest(request, 'request', 'estimateFees')
  //
  //     /** validate options, if present */
  //     if (options) {
  //       this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['estimateFees', 'options']))
  //       validateOptions(options, 'estimateFees')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError(makeString(ERRORS.service.gotError, ['estimateFees', 'validation']), err)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   let response: EstimatedFee
  //
  //   /** make request */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.requestingData, ['estimateFees']))
  //
  //     response = await this._estimateFees.get(request)
  //
  //     this._log(makeString(MESSAGES.technical.gotResponse, ['estimateFees']), response)
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logApiError(makeString(ERRORS.service.gotError, ['estimateFees', 'request']), err)
  //
  //     /** throw appropriate error */
  //     throw makeApiResponseError(err)
  //   }
  //
  //   /** return the results */
  //   this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['estimateFees', 'return']))
  //
  //   if (shouldReturnDirect(options, this._respondAs)) return response
  //
  //   this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['estimateFees']))
  //   this._useEventBus(EventTypes.ESTIMATE_FEES, response)
  // }

  // public async getBalance(address: string, options?: Omit<RequestOptions, 'watch'>): Promise<Maybe<Balance>> {
  //   this._logTechnical(makeString(MESSAGES.technical.running, ['getBalance']))
  //
  //   /** validate props */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.checkingProps, ['getBalance']))
  //
  //     if (isNil(address)) throw new Error(TEXT.errors.validation.missingArgument)
  //
  //     validateAddress({ address, currency: Currencies.Ethereum, networkType: this._network })
  //
  //     /** validate options, if present */
  //     if (options) {
  //       this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getBalance', 'options']))
  //       validateOptions(options, 'getBalance')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError(makeString(ERRORS.service.gotError, ['getBalance', 'validation']), err)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   let response: Balance
  //
  //   /** make request */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getBalance']))
  //
  //     response = await this._balance.get(address)
  //     this._log(makeString(MESSAGES.technical.gotResponse, ['getBalance']), response)
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logApiError(makeString(ERRORS.service.gotError, ['getBalance', 'request']), err)
  //
  //     /** throw appropriate error */
  //     throw makeApiResponseError(err)
  //   }
  //
  //   /** return the results */
  //   this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getBalance', 'return']))
  //
  //   if (shouldReturnDirect(options, this._respondAs)) return response
  //
  //   this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getBalance']))
  //   this._useEventBus(EventTypes.GET_BALANCE, response)
  // }

  // public async ethTransferRequest(
  //   request: EthTransferRequest,
  //   options?: Omit<RequestOptions, 'watch'>,
  // ): Promise<Maybe<EthTransferResponse>> {
  //   this._logTechnical(makeString(MESSAGES.technical.running, ['ethTrasferRequest']))
  //
  //   /** validate props */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.checkingProps, ['ethTransferRequest']))
  //
  //     if (isNil(request)) throw new Error(TEXT.errors.validation.missingArgument)
  //
  //     validateObject(request, 'request')
  //     validateEthTransferRequest(request, 'request', 'ethTransferRequest')
  //
  //     /** validate options, if present */
  //     if (options) {
  //       this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['ethTransferRequest', 'options']))
  //       validateOptions(options, 'ethTransferRequest')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError(makeString(ERRORS.service.gotError, ['ethTransferRequest', 'validation']), err)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   let response: EthTransferResponse
  //
  //   /** make request */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.requestingData, ['ethTransferRequest']))
  //
  //     response = await this._ethTransferRequest.create(request)
  //
  //     this._log(makeString(MESSAGES.technical.gotResponse, ['ethTransferRequest']), response)
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logApiError(makeString(ERRORS.service.gotError, ['ethTransferRequest', 'request']), err)
  //
  //     /** throw appropriate error */
  //     throw makeApiResponseError(err)
  //   }
  //
  //   /** return the results */
  //   this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['ethTransferRequest', 'return']))
  //
  //   if (shouldReturnDirect(options, this._respondAs)) return response
  //
  //   this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['ethTransferRequest']))
  //   this._useEventBus(EventTypes.ETH_TRANSFER_REQUEST, response)
  // }

  // public async collectEth(
  //   request: CollectRequest,
  //   options?: Omit<QueryOptions, 'limit' | 'skip'>,
  // ): Promise<Maybe<TxHash>> {
  //   this._logTechnical(makeString(MESSAGES.technical.running, ['collectEth']))
  //
  //   /** validate props */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.checkingProps, ['collectEth']))
  //     validateObjectWithStrings(Type<Record<string, unknown>>(request), 'request', 'collectEth')
  //
  //     /** validate options, if present */
  //     if (options) {
  //       validateOptions(options, 'collectEth')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError(makeString(ERRORS.service.gotError, ['collectEth', 'validation']), err)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   let response
  //
  //   /** make request */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.requestingData, ['collectEth']))
  //     response = await this._collect.create({ ...request })
  //     this._log(makeString(MESSAGES.technical.gotResponse, ['collectEth']), response)
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logApiError(makeString(ERRORS.service.gotError, ['collectEth', 'request']), err)
  //
  //     /** throw appropriate error */
  //     throw makeApiResponseError(err)
  //   }
  //
  //   try {
  //
  //     /** return the results */
  //     this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['collectEth', 'return']))
  //
  //     if (shouldReturnDirect(options, this._respondAs)) return response
  //
  //     this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['collectEth']))
  //     this._useEventBus(EventTypes.COLLECT_TRANSACTION, response)
  //   } catch (err) {
  //     throw makeReturnError(err.message, err)
  //   }
  // }

  // public async follow(txid: string, options?: Omit<QueryOptions, 'limit' | 'skip'>): Promise<Maybe<Txid>> {
  //   this._logTechnical(makeString(MESSAGES.technical.running, ['follow']))
  //
  //   /** validate props */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.checkingProps, ['follow']))
  //     validateHex(txid, 'txid', 'follow')
  //
  //     /** validate options, if present */
  //     if (options) {
  //       validateOptions(options, 'follow')
  //     }
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logError(makeString(ERRORS.service.gotError, ['follow', 'validation']), err)
  //
  //     /** throw appropriate error */
  //     throw makePropsResponseError(err)
  //   }
  //
  //   let response: Txid
  //
  //   /** make request */
  //   try {
  //     this._logTechnical(makeString(MESSAGES.technical.requestingData, ['follow']))
  //     response = await this._follow.create({ txid })
  //     this._log(makeString(MESSAGES.technical.gotResponse, ['follow']), response)
  //   } catch (err) {
  //
  //     /** log error */
  //     this._logApiError(makeString(ERRORS.service.gotError, ['follow', 'request']), err)
  //
  //     /** throw appropriate error */
  //     throw makeApiResponseError(err)
  //   }
  //
  //   try {
  //
  //     /** return the results */
  //     this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['follow', 'return']))
  //
  //     if (shouldReturnDirect(options, this._respondAs)) return response
  //
  //     this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['follow']))
  //     this._useEventBus(EventTypes.FOLLOW, response)
  //   } catch (err) {
  //     throw makeReturnError(err.message, err)
  //   }
  // }
}

export { Service };
