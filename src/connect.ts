import feathers, { Application, HookContext } from '@feathersjs/feathers';
import io from 'socket.io-client';
import crypto from 'crypto-js';
import socket from '@feathersjs/socketio-client';
import { AuthenticationResult } from '@feathersjs/authentication';
import auth, { Storage, MemoryStorage } from '@feathersjs/authentication-client';

import { Base } from './base';
import {
  debugLevelSelector,
  capitalize,
  makeString,
  diff,
  getTime,
  Type,
  makeOptions,
  makePropsResponseError,
  shouldReturnDirect,
  buildEndpointPath,
  makeReturnError,
  findInServices,
} from './tools';
import { validateOptions, validateSettings } from './validators';
import {
  AuthDetails,
  ConnectProps,
  Status,
  NetworkTip,
  ApiService,
  Endpoints,
  EventTypes,
  RequestOptions,
  Results,
  AnyValue,
  InstanceOptions,
  Maybe,
  Either,
  Responses,
  QueryOptions,
  ApiError,
  Watch,
  Currencies,
  Networks,
  RequestedService,
} from './types';

import { apiUrl as apiUrlFromConfig, connectionTriesMax, connectionTimeout } from './config';
import { WARNINGS, ERRORS, MESSAGES } from './text';
import { StorageWrapper } from '@feathersjs/authentication-client/lib/storage';
import { MakeServiceParameters } from './types/fns';

let apiUrl = apiUrlFromConfig;

function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);

  const bufView = new Uint8Array(buf);

  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }

  return buf;
}

const generateKey = async () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-CBC',
      length: 128,
    },
    true,
    ['encrypt', 'decrypt'],
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(16));

  return { key, iv };
};

const chunkSubstr = (str: string, size: number) => {
  const numChunks = Math.ceil(str.length / size);

  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
};

let _authKey: string | undefined = undefined;

const _payloadKey: { key: CryptoKey; iv: ArrayBuffer }[] = [];

let _payloadCount = 0;

const authEncrypt = async (payload: Record<string, unknown>, sessionId: number) => {
  if (typeof window === 'undefined') {
    return payload;
  }

  const data = { ...payload };

  _payloadKey[sessionId] = (await generateKey()) as { key: CryptoKey; iv: ArrayBuffer };

  if (_payloadKey[sessionId]) {
    const keyData = await window.crypto.subtle.exportKey('raw', _payloadKey[sessionId].key);

    data.encrypt = {
      key: Buffer.from(keyData).toString('base64'),
      iv: Buffer.from(_payloadKey[sessionId].iv).toString('base64'),
    };
  }

  const binaryDer = str2ab(window.atob(window.atob(_authKey || '')));

  const publicKey = await window.crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt'],
  );

  const chunks = chunkSubstr(JSON.stringify(data), 60);

  const encrypted: string[] = [];

  for (const chunk of chunks) {
    const enc = new TextEncoder();

    const encoded = enc.encode(chunk);

    const ciphertext = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, encoded);

    const buffer = ciphertext ? new Uint8Array(ciphertext) : new Uint8Array();

    encrypted.push(btoa(String.fromCharCode.apply(null, buffer as AnyValue)));
  }

  return { encrypted };
};

const encrypt = async (payload: Record<string, unknown>, sessionId: number) => {
  if (typeof window === 'undefined' || typeof _payloadKey[sessionId] === 'undefined') {
    return payload;
  }

  const enc = new TextEncoder();

  const encoded = enc.encode(JSON.stringify(payload));

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: _payloadKey[sessionId].iv,
    },
    _payloadKey[sessionId].key,
    encoded,
  );

  const buffer = new Uint8Array(ciphertext);

  const encrypted = btoa(String.fromCharCode.apply(null, buffer as AnyValue));

  return { encrypted };
};

const decrypt = async (payload: Record<string, unknown>, sessionId: number) => {
  if (
    typeof window === 'undefined' ||
    typeof _payloadKey[sessionId] === 'undefined' ||
    typeof payload.encrypted !== 'string'
  ) {
    return payload;
  }

  const ciphertext = await window.crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv: _payloadKey[sessionId].iv,
    },
    _payloadKey[sessionId].key,
    str2ab(window.atob(payload.encrypted)),
  );

  const buffer = new Uint8Array(ciphertext);

  const decrypted = String.fromCharCode.apply(null, buffer as AnyValue);

  return JSON.parse(decrypted);
};

class Connect extends Base {
  #connect: Application<unknown>;

  #socket: SocketIOClient.Socket;

  protected _connectionCounter = 0;

  protected _lastConnect: number | undefined = undefined;

  protected _manuallyDisconnected = false;

  constructor(props: ConnectProps, options: Maybe<InstanceOptions>) {
    super(debugLevelSelector(options?.debug));

    this._logTechnical("Service (connect > constructor) sent 'debug' setting to super, validating props");

    this._validateProps(props);

    const { authDetails, eventBus, watch } = props;

    this._logTechnical('Service (connect > constructor) assigns instance variables...');

    this._respondAs = eventBus ? Responses.Callback : Responses.Direct;

    if (watch && watch !== this._watch) this._watch = watch;

    this._auth = authDetails;

    this._sessionId = ++_payloadCount;

    if (eventBus) this._eventBus = eventBus;

    // setup
    this._logTechnical('Service is configuring connection...');

    if (options?.globalCurrency) this._globalCurrency = options.globalCurrency;

    if (options?.globalNetwork) this._globalNetwork = options.globalNetwork;

    // if authentication process is required for external url, set it globally
    if (options?.withAuth && options?.url) apiUrl = options?.url;

    // choose url to use
    this.#socket = io.connect(options?.url || apiUrl) as never;

    this.#socket.on('encrypt', (publicKey: string) => {
      if (typeof window !== 'undefined') {
        _authKey = publicKey;
      }
    });

    const connect = feathers().configure(
      socket(this.#socket, {
        timeout: 20000,
      }),
    );

    class safeStorage implements Storage {
      private storage: MemoryStorage | StorageWrapper;

      private key: string;

      constructor(key = Math.random().toString(36).substring(7) + Math.random().toString(36).substring(7)) {
        this.storage = new MemoryStorage();
        this.key = key;
      }

      async getItem(key: string) {
        const cipherText = await this.storage.getItem(key);

        const bytes = crypto.AES.encrypt(cipherText, this.key);

        return JSON.parse(bytes.toString(Type(crypto.enc.Utf8)));
      }

      async setItem(key: string, value: AnyValue) {
        const cipherText = crypto.AES.encrypt(JSON.stringify(value), this.key);

        return await this.storage.setItem(key, cipherText.toString());
      }

      async removeItem(key: string) {
        return await this.storage.removeItem(key);
      }
    }

    // configure if built-in url
    if (options?.url && !options?.withAuth) this.#connect = connect;
    else this.#connect = connect.configure(auth({ storageKey: 'auth', storage: new safeStorage() }));

    // connect/disconnect event processes
    this._logTechnical('Service is setting up connect/disconnect listeners...');

    try {
      this.#connect.io.on('connect', (): void => {
        this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['is connected', 'authorization']));

        this._logTechnical(makeString(MESSAGES.technical.serviceIs, ["checking if it's allowed to proceed:"]));

        this._logTechnical(`➜ connectionCounter: ${this._connectionCounter}`);
        this._logTechnical(`➜ lastConnect: ${this._lastConnect}`);

        if (
          this._connectionCounter <= connectionTriesMax &&
          (!this._lastConnect || diff(this._lastConnect) > connectionTimeout)
        ) {
          this._logTechnical(MESSAGES.technical.isAllowed);
          this._useEventBus(EventTypes.CONNECT, true);

          // if  custom url is not provided
          if (!options?.url || options?.withAuth) this._runAuth();
        } else {
          this._logTechnical(MESSAGES.technical.notAllowed);

          // show tech message, that exceed connection qty
          if (this._connectionCounter > connectionTriesMax) {
            this._exceededQtyLog(connectionTriesMax);
            this.#socket.disconnect().close();
            this._manuallyDisconnected = true;
          } else {
            if (diff(this._lastConnect) <= connectionTimeout) {
              this._tooEarlyToConnectLog(this._lastConnect, connectionTimeout);
              this.#socket.disconnect().close();
              this._manuallyDisconnected = true;
              setTimeout(() => {
                this._manuallyDisconnected = false;

                // if  custom url is not provided
                if (!options?.url || options?.withAuth) this._runAuth();
              }, connectionTimeout * 1000);
            }
          }
        }
      });
    } catch (err) {
      this._logApiError(ERRORS.connect.on.connect.direct, err);
    }

    try {
      this.#connect.io.on('disconnect', (payload: string) => {
        this._logApiWarning(WARNINGS.connect.disconnect, capitalize(payload));
        this._useEventBus(EventTypes.DISCONNECT, true);
      });
    } catch (err) {
      this._logApiError(ERRORS.connect.on.disconnect.direct, err);
    }

    this._logTechnical(makeString(MESSAGES.technical.serviceIs, ['setting up event listeners...']));

    // rates updated
    // this._rateBtcToUsd.on('updated', (data: unknown) => {
    //   this._useEventBus(
    //     this._currency === Currencies.Bitcoin ? EventTypes.UPDATE_RATES : EventTypes.UPDATE_RATES_ETH,
    //     data,
    //     decrypt,
    //   )
    // })

    // status updated
    // this._networks.on('patched', (data: NetworkTip) => {
    //   this._useEventBus(EventTypes.UPDATE_STATUS, data, decrypt);
    // });

    // transfer updated
    // this._transfers.on('patched', (payload: Transfer) => {
    //   this._useEventBus(EventTypes.UPDATED_RETRIEVABLE, payload, decrypt)
    // })
    //
    // this._transfers.on('created', (payload: Transfer) => {
    //   this._useEventBus(EventTypes.UPDATED_RETRIEVABLE, payload, decrypt)
    // })
    //
    // // transfer removed
    // this._transfers.on('removed', (payload: Transfer) => {
    //   this._useEventBus(EventTypes.REMOVED_RETRIEVABLE, payload, decrypt)
    // })
    //
    //
    // // new collectable has been created for the previously requested address
    // this._inbox.on('created', (payload: Collectable) => {
    //   this._useEventBus(EventTypes.CREATED_COLLECTABLE, payload, decrypt)
    // })
    //
    // // collectable patched
    // this._inbox.on('patched', (payload: Collectable) => {
    //   this._useEventBus(EventTypes.UPDATED_COLLECTABLE, payload, decrypt)
    // })
    //
    // // collectable removed
    // this._inbox.on('removed', (payload: Collectable) => {
    //   this._useEventBus(EventTypes.REMOVED_COLLECTABLE, payload, decrypt)
    // })

    // set internet connection check
    if (typeof window === 'undefined') {
      // this is backend
      setInterval(() => {
        this._logTechnical('Checking connection status...');
        require('dns')
          .promises.lookup('google.com')
          .then(() => {
            if (!this.#connect.io.connected && this._connectionCounter <= connectionTriesMax) {
              this._logTechnical('Connection is online, but service is not');

              if (this._manuallyDisconnected) this._logTechnical(MESSAGES.technical.connection.wontReconnect);
              else {
                this._logTechnical('Reconnecting');
                this.#connect.io.connect();
              }
            }

            if (this._connectionCounter > connectionTriesMax)
              this._logApiWarning(
                makeString(MESSAGES.technical.connection.exceeded, [this._connectionCounter, connectionTriesMax]),
              );
          })
          .catch(() => {
            if (this.#connect.io.connected) {
              this._logTechnical(MESSAGES.technical.connection.willConnect);
              this.#connect.io.disconnect();
            }
          });
      }, 3000);
    } else {
      window.addEventListener('online', () => {
        if (!this.#connect.io.connected && this._connectionCounter <= connectionTriesMax) {
          this._logTechnical(MESSAGES.technical.connection.willReConnect);
          this.#connect.io.connect();
        }

        if (!this.#connect.io.connected && this._connectionCounter > connectionTriesMax)
          this._logApiWarning(MESSAGES.technical.connection.willNotReconnect);
      });
    }
  }

  /*
   * Function to disconnect ws connection
   */
  protected _destroySocket(): void {
    if (this.#connect) this.#connect.io.destroy();
  }

  // TODO: add options validation
  /*
   * Validate props for service
   */
  private _validateProps(settings: unknown): void {
    try {
      this._logTechnical(makeString(MESSAGES.technical.serviceIs, ['validating settings provided']));
      validateSettings(settings);
    } catch (err) {
      this._logError(makeString(ERRORS.service.gotError, ['validateProps', 'err.message']), err);

      throw new TypeError(err.message);
    }
  }

  private _runAuth(): void {
    this._logTechnical(makeString(MESSAGES.technical.running, ['runAuth']));
    Type<Promise<AuthDetails>>(this._authSocket())
      .then(async () => {
        this._logTechnical('Service is authed, resetting connectionCounter.');
        this._connectionCounter = 0;
        this._logTechnical('Setting lastConnect timestamp.');
        this._lastConnect = getTime();
        await this.#connect.get('authentication');
        this.isAuthed = true;
        this._onConnect();
      })
      .catch(err => {
        this._logTechnical(ERRORS.service.failedAuth);
        this.isAuthed = false;
        this._connectionCounter++;
        this._logTechnical('Setting lastConnect timestamp.');
        this._lastConnect = getTime();
        this._logApiError(ERRORS.connect.on.connect.authSocket, err);
      });
  }

  private _authSocket(): Either<Promise<Either<AuthenticationResult, void>>, undefined> {
    this._logTechnical(makeString(MESSAGES.technical.running, ['authSocket']));

    try {
      this._logTechnical('Service (authSocket) is trying to re-authenticate...');

      return this.#connect.reAuthenticate().catch(async () => {
        this._logTechnical(makeString(ERRORS.service.failedTo, ['authSocket', 're-authenticate', 'authentication']));
        this.#connect
          .authenticate({
            strategy: 'local',
            ...(await authEncrypt({ ...this._auth }, this._sessionId)),
          })
          .catch(err => {
            // if not
            this._logApiError(ERRORS.connect.authenticate, err);
            this._logTechnical('Set connectionCounter to MAX+1.');
            this._connectionCounter = connectionTriesMax + 1;
            this._logTechnical('Set lastConnect timestamp.');
            this._lastConnect = getTime();
          });
      });
    } catch (err) {
      this._logApiError(ERRORS.connect.reAuthenticate, err);
      this._logTechnical('Set connectionCounter to MAX+1.');
      this._connectionCounter = connectionTriesMax + 1;
      this._logTechnical('Set lastConnect timestamp.');
      this._lastConnect = getTime();
      return;
    }
  }

  private _onConnect(): void {
    this._log('Service (connect) is ON, requesting latest status...');

    if (this._globalNetwork && this._globalCurrency)
      this.getStatusFor({ watch: Watch.REPLACE }).catch(err => {
        this._logApiError('Service (onConnect) caught error when calling (getStatus).', err);
      });

    // TODO: which inbox? should it even be cached at all? which items to be cached?
    // this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['onConnect', 'refreshInbox']))
    // this._refreshInbox()
  }

  // TODO: add desc
  // private async _refreshInbox(): Promise<void> {
  //   this._logTechnical(makeString(MESSAGES.technical.running, ['refreshInbox']))
  //
  //   if (this._lastAddresses && this._lastAddresses.addresses.length) {
  //     this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['refreshInbox', 'refreshing collects...']))
  //     let response
  //
  //     try {
  //       this._logTechnical(makeString(MESSAGES.technical.requestingData, ['refreshInbox']))
  //       response = await this._inbox.find({
  //         query: {
  //           to: this._lastAddresses.addresses.join(';'),
  //           ...makeOptions(this._lastAddresses.options, this._watch),
  //         },
  //       })
  //       this._log(makeString(MESSAGES.technical.gotResponse, ['refreshInbox']), response)
  //     } catch (err) {
  //
  //       /** log error */
  //       this._logApiError(makeString(ERRORS.service.gotError, ['refreshInbox', 'request']), err)
  //
  //       /** throw appropriate error */
  //       throw makeApiResponseError(err)
  //     }
  //
  //     /** return results */
  //
  //     this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['refreshInbox', 'return']))
  //     this._useEventBus(EventTypes.GET_COLLECTABLES, response)
  //   }
  // }

  /*
   * Assign service with hooks for provided currency, network and service
   *
   * @params { MakeServiceParameters } params - parameters required to build
   * endpoint path
   *
   * @returns ApiService
   *
   */
  private _getService(params: MakeServiceParameters): ApiService {
    this._logTechnical(makeString(MESSAGES.technical.service, ['getService']), params.endpoint);

    return this.#connect.service(buildEndpointPath(params)).hooks({
      before: {
        all: [
          async (context: HookContext) => {
            if (context.params.query) {
              context.params.query = await encrypt(context.params.query, this._sessionId);
            }
          },
        ],
      },
      after: {
        all: [
          async (context: HookContext) => {
            if (context.result) {
              context.result = await decrypt(context.result, this._sessionId);
            }
          },
        ],
      },
      error: {
        all: [
          async (context: HookContext) => {
            if (context.error) {
              context.error = await decrypt(context.error, this._sessionId);
            }
          },
        ],
      },
    });
  }

  /*
   * Abstraction for validation errors - log and response
   */
  protected _processValidationError(err: Error, fnName: string) {
    this._logError(makeString(ERRORS.service.gotError, [fnName, 'validation']), err);

    throw makePropsResponseError(err);
  }

  /*
   * Abstraction for API request errors - log and response
   */
  protected _processApiError(err: ApiError, fnName: string) {
    this._logApiError(makeString(ERRORS.service.gotError, [fnName, 'request']), err);

    throw makeReturnError(err.message, err);
  }

  /*
   * Abstraction for returning results - log, direct vs eventBus
   */
  protected _returnResults<T>(
    options: QueryOptions | RequestOptions | undefined,
    response: T,
    fnName: string,
    event: EventTypes,
  ) {
    this._logTechnical(makeString(MESSAGES.technical.proceedingWith, [fnName, 'return']));

    if (shouldReturnDirect(options, this._respondAs)) return response;

    this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, [fnName]));

    this._useEventBus(event, response);

    return;
  }

  /*
   * Get status for network; response varies for different currencies
   *
   * @params { RequestOptions } [options] - optional parameters
   *
   * @returns Status - only in case of direct response
   *
   */
  public async getStatusFor(options?: RequestOptions): Promise<Either<Status, void>> {
    this._logTechnical(makeString(MESSAGES.technical.running, ['getStatusFor']));

    /** validate options, if present */
    try {
      if (options) {
        this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getStatusFor', 'options']));
        validateOptions(options, 'getStatusFor', true);
      }
    } catch (err) {
      this._processValidationError(err, 'getStatusFor');
    }

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getStatusFor']));

      const currencyNetwork = this.getCurrencyNetwork(options?.currency, options?.network);

      const service = this._retrieveServiceOrMakeNew(currencyNetwork, Endpoints.Networks);

      const response: Results<NetworkTip> = await service.request.find({
        query: { netId: currencyNetwork.network, ...makeOptions(options, this._watch) },
      });

      if (service.isNew) {
        service.request.on('patched', (data: NetworkTip) => {
          this._useEventBus(EventTypes.UPDATE_STATUS, data, decrypt);
        });
        this._storeService(currencyNetwork, Endpoints.Networks, service.request);
      }

      this._returnResults(options, response.data[0], 'getStatusFor', EventTypes.GET_ONLINE_NETWORKS);
    } catch (err) {
      this._processApiError(err, 'getStatusFor');
    }
  }

  // TODO: add description
  protected _retrieveServiceOrMakeNew(
    currencyNetwork: { currency: Currencies; network: Networks },
    endpoint: Endpoints,
  ): RequestedService {
    const service = findInServices(this._services, currencyNetwork, endpoint);

    if (!!service) return { request: service, isNew: false };

    return {
      request: this._getService({
        ...currencyNetwork,
        endpoint,
      }),
      isNew: true,
    };
  }

  /*
   * Get ws connection status
   *
   * @params { Object } [options] - respondDirect option only
   *
   * @returns Boolean - only in case of direct response
   *
   */
  public getIsConnected(options?: { respondDirect: boolean }): boolean | void {
    this._logTechnical(makeString(MESSAGES.technical.running, ['getIsConnected']));

    /** validate options, if present */
    try {
      if (options) {
        validateOptions(options, 'getIsConnected');
      }
    } catch (err) {
      this._processValidationError(err, 'getIsConnected');
    }

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getIsConnected']));

      const response = this.#connect.io.io.readyState === 'open';

      this._log(makeString(MESSAGES.technical.gotResponse, ['getIsConnected']), response);
      this._returnResults(options, response, 'getIsConnected', EventTypes.GET_IS_CONNECTED);
    } catch (err) {
      this._processApiError(err, 'getIsConnected');
    }
  }

  public connect(options?: { respondDirect: boolean }): boolean | void {
    this._logTechnical(makeString(MESSAGES.technical.running, ['connect']));

    /** validate options, if present */
    try {
      if (options) {
        this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['connect', 'options']));
        validateOptions(options, 'connect');
      }
    } catch (err) {
      this._processValidationError(err, 'connect');
    }

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['connect']));
      this.#socket.connect().open();

      const response = true;

      this._manuallyDisconnected = false;
      this._log(makeString(MESSAGES.technical.gotResponse, ['connect']), response);
      this._returnResults(options, response, 'connect', EventTypes.CONNECT);
    } catch (err) {
      this._processApiError(err, 'connect');
    }
  }
}

export { Connect };
