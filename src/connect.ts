import feathers, { Application, HookContext } from '@feathersjs/feathers'
import io from 'socket.io-client'
import crypto from 'crypto-js'
import socket from '@feathersjs/socketio-client'
import { AuthenticationResult } from '@feathersjs/authentication'
import auth, { Storage, MemoryStorage } from '@feathersjs/authentication-client'

import { Base } from './base'
import {
  debugLevelSelector,
  capitalize,
  makeString,
  diff,
  getTime,
  changeType,
  makeOptions,
  makeApiResponseError,
  makeReturnError,
  makePropsResponseError,
  shouldReturnDirect,
  isDirect,
} from './tools'
import { validateOptions, validateSettings } from './validators'
import {
  AuthDetails,
  ConnectProps,
  QueryOptions,
  Status,
  NetworkTip,
  ApiService,
  Endpoints,
  EventTypes,
  Collectable,
  Transfer,
  RequestOptions,
  Results,
} from './types'

import { apiUrl, version, endpoints, connectionTriesMax, connectionTimeout } from './config'
import { WARNINGS, ERRORS, MESSAGES } from './text'
import { StorageWrapper } from '@feathersjs/authentication-client/lib/storage'

function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length)

  const bufView = new Uint8Array(buf)

  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }

  return buf
}

const generateKey = async () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  const key = await window.crypto.subtle.generateKey(
    {
        name: 'AES-CBC',
        length: 128,
    },
    true,
    ['encrypt', 'decrypt']
  )

  const iv = window.crypto.getRandomValues(new Uint8Array(16))

  return { key, iv }
}

const chunkSubstr = (str: string, size: number) => {
  const numChunks = Math.ceil(str.length / size)

  const chunks = new Array(numChunks)

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size)
  }

  return chunks
}

let _authKey: string | undefined = undefined

const _payloadKey: { key: CryptoKey, iv: ArrayBuffer }[] = []

let _payloadCount = 0;

const authEncrypt = async (payload: Record<string, unknown>, sessionId: number) => {
  if (typeof window === 'undefined') {
    return payload
  }

  const data = { ...payload }

  _payloadKey[sessionId] = await generateKey() as { key: CryptoKey, iv: ArrayBuffer }

  if (_payloadKey[sessionId]) {
    const keyData = await window.crypto.subtle.exportKey('raw', _payloadKey[sessionId].key)

    data.encrypt = {
      key: Buffer.from(keyData).toString('base64'),
      iv: Buffer.from(_payloadKey[sessionId].iv).toString('base64'),
    }
  }

  const binaryDer = str2ab(window.atob(window.atob(_authKey || '' )))

  const publicKey = await window.crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt'],
    )

  const chunks = chunkSubstr(JSON.stringify(data), 60)

  const encrypted : string[] = []

  for (const chunk of chunks) {
    const enc = new TextEncoder()

    const encoded = enc.encode(chunk)

    const ciphertext = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, encoded)

    const buffer = ciphertext ? new Uint8Array(ciphertext) : new Uint8Array()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    encrypted.push(btoa(String.fromCharCode.apply(null, buffer as any)))
  }

  return { encrypted }
}

const encrypt = async (payload: Record<string, unknown>, sessionId: number) => {
  if (typeof window === 'undefined' || typeof _payloadKey[sessionId] === 'undefined') {
    return payload
  }

  const enc = new TextEncoder()

  const encoded = enc.encode(JSON.stringify(payload))

  const ciphertext = await window.crypto.subtle.encrypt({
    name: 'AES-CBC',
    iv:_payloadKey[sessionId].iv
    },
    _payloadKey[sessionId].key,
    encoded
  )

  const buffer = new Uint8Array(ciphertext)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const encrypted = btoa(String.fromCharCode.apply(null, buffer as any))

  return { encrypted }
}

const decrypt = async (payload: Record<string, unknown>, sessionId: number) => {
  if (typeof window === 'undefined' || typeof _payloadKey[sessionId] === 'undefined' || typeof payload.encrypted !== 'string') {
    return payload
  }

  const ciphertext = await window.crypto.subtle.decrypt({
    name: 'AES-CBC',
    iv: _payloadKey[sessionId].iv
    },
    _payloadKey[sessionId].key,
    str2ab(window.atob(payload.encrypted))
  )

  const buffer = new Uint8Array(ciphertext)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decrypted = String.fromCharCode.apply(null, buffer as any)

  return JSON.parse(decrypted)
}

class Connect extends Base {
  private _connect: Application<unknown>

  private _socket: SocketIOClient.Socket

  protected _connectionCounter = 0

  protected _lastConnect: number | undefined = undefined

  protected _networks: ApiService

  protected _transfers: ApiService

  protected _inbox: ApiService

  protected _collect: ApiService

  protected _utxos: ApiService

  protected _exists: ApiService

  protected _rateBtcToUsd: ApiService

  protected _retrieve: ApiService

  protected _transactions: ApiService

  protected _manuallyDisconnected = false

  constructor(props: ConnectProps) {
    super(debugLevelSelector(props?.debug))

    this._logTechnical('Service (connect > constructor) sent \'debug\' setting to super, validating props')

    this._validateProps(props)

    const { network, currency, authDetails, eventBus, respondAs, watch } = props

    this._logTechnical('Service (connect > constructor) assigns instance variables...')

    if (currency && currency !== this._currency) this._currency = currency

    if (network && network !== this._network) this._network = network

    if (respondAs && respondAs !== this._respondAs) this._respondAs = respondAs

    if (watch && watch !== this._watch) this._watch = watch

    this._auth = authDetails

    this._sessionId = ++_payloadCount

    if (eventBus) this._eventBus = eventBus

    // setup
    this._logTechnical('Service is configuring connection...')

    this._socket = io.connect(apiUrl) as never

    this._socket.on('encrypt', (publicKey: string) => {
      if (typeof window !== 'undefined') {
        _authKey = publicKey
      }
    })

    const connect = feathers().configure(
      socket(this._socket, {
        timeout: 20000,
      }),
    )

    class safeStorage implements Storage {
      private storage: MemoryStorage | StorageWrapper

      private key: string

      constructor(key = Math.random().toString(36)
.substring(7) + Math.random().toString(36)
.substring(7)) {
        this.storage = new MemoryStorage()
        this.key = key
      }

      async getItem(key: string) {
        const cipherText = await this.storage.getItem(key)

        const bytes = crypto.AES.encrypt(cipherText, this.key)

        return JSON.parse(bytes.toString(crypto.enc.Utf8))
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async setItem(key: string, value: any) {
        const cipherText = crypto.AES.encrypt(JSON.stringify(value), this.key)

        return await this.storage.setItem(key, cipherText.toString())
      }

      async removeItem(key: string) {
        return await this.storage.removeItem(key)
      }
    }

    this._connect = connect.configure(auth({ storageKey: 'auth', storage: new safeStorage() }))

    // connect/disconnect event processes
    this._logTechnical('Service is setting up connect/disconnect listeners...')

    try {
      this._connect.io.on('connect', (): void => {
        this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['is connected', 'authorization']))

        this._logTechnical(makeString(MESSAGES.technical.serviceIs, ['checking if it\'s allowed to proceed:']))

        this._logTechnical(`➜ connectionCounter: ${this._connectionCounter}`)
        this._logTechnical(`➜ lastConnect: ${this._lastConnect}`)

        if (
          this._connectionCounter <= connectionTriesMax &&
          (!this._lastConnect || diff(this._lastConnect) > connectionTimeout)
        ) {
          this._logTechnical(MESSAGES.technical.isAllowed)
          this._useEventBus(EventTypes.CONNECT, true)
          this._runAuth()
        } else {
          this._logTechnical(MESSAGES.technical.notAllowed)

          // show tech message, that exceed connection qty
          if (this._connectionCounter > connectionTriesMax) {
            this._exceededQtyLog(connectionTriesMax)
            this._socket.disconnect().close()
            this._manuallyDisconnected = true
          } else {
            if (diff(this._lastConnect) <= connectionTimeout) {
              this._tooEarlyToConnectLog(this._lastConnect, connectionTimeout)
              this._socket.disconnect().close()
              this._manuallyDisconnected = true
              setTimeout(() => {
                this._manuallyDisconnected = false
                this._runAuth()
              }, connectionTimeout * 1000)
            }
          }
        }
      })
    } catch (err) {
      this._logApiError(ERRORS.connect.on.connect.direct, err)
    }

    try {
      this._connect.io.on('disconnect', (payload: string) => {
        this._logApiWarning(WARNINGS.connect.disconnect, capitalize(payload))
        this._useEventBus(EventTypes.DISCONNECT, true)
      })
    } catch (err) {
      this._logApiError(ERRORS.connect.on.disconnect.direct, err)
    }

    // assign services
    this._logTechnical(makeString(MESSAGES.technical.serviceIs, ['setting up API services']))
    this._networks = this._getService(Endpoints.Networks)
    this._transfers = this._getService(Endpoints.Transfers)
    this._inbox = this._getService(Endpoints.Inbox)
    this._collect = this._getService(Endpoints.Collect)
    this._utxos = this._getService(Endpoints.Utxos)
    this._exists = this._getService(Endpoints.Exists)
    this._rateBtcToUsd = this._getService(Endpoints.RateToUsd)
    this._retrieve = this._getService(Endpoints.Retrieve)
    this._transactions = this._getService(Endpoints.Transactions)

    this._logTechnical(makeString(MESSAGES.technical.serviceIs, ['setting up event listeners...']))

    // rates updated
    this._rateBtcToUsd.on('updated', (data: unknown) => {
      this._useEventBus(EventTypes.UPDATE_RATES, data, decrypt)
    })

    // status updated
    this._networks.on('patched', (data: NetworkTip) => {
      this._useEventBus(EventTypes.UPDATE_STATUS, data, decrypt)
    })

    // transfer updated
    this._transfers.on('patched', (payload: Transfer) => {
      this._useEventBus(EventTypes.UPDATED_RETRIEVABLE, payload, decrypt)
    })

    // transfer removed
    this._transfers.on('removed', (payload: Transfer) => {
      this._useEventBus(EventTypes.REMOVED_RETRIEVABLE, payload, decrypt)
    })

    // new collectable has been created for the previously requested address
    this._inbox.on('created', (payload: Collectable) => {
      this._useEventBus(EventTypes.CREATED_COLLECTABLE, payload, decrypt)
    })

    // collectable patched
    this._inbox.on('patched', (payload: Collectable) => {
      this._useEventBus(EventTypes.UPDATED_COLLECTABLE, payload, decrypt)
    })

    // collectable removed
    this._inbox.on('removed', (payload: Collectable) => {
      this._useEventBus(EventTypes.REMOVED_COLLECTABLE, payload, decrypt)
    })

    // set internet connection check
    if (typeof window === 'undefined') {
      // this is backend
      setInterval(() => {
        this._logTechnical('Checking connection status...')
        require('dns')
          .promises.lookup('google.com')
          .then(() => {
            if (!this._connect.io.connected && this._connectionCounter <= connectionTriesMax) {
              this._logTechnical('Connection is online, but service is not')

              if (this._manuallyDisconnected) this._logTechnical(MESSAGES.technical.connection.wontReconnect)
              else {
                this._logTechnical('Reconnecting')
                this._connect.io.connect()
              }
            }

            if (this._connectionCounter > connectionTriesMax)
              this._logApiWarning(
                makeString(MESSAGES.technical.connection.exceeded, [this._connectionCounter, connectionTriesMax]),
              )
          })
          .catch(() => {
            if (this._connect.io.connected) {
              this._logTechnical(MESSAGES.technical.connection.willConnect)
              this._connect.io.disconnect()
            }
          })
      }, 3000)
    } else {
      window.addEventListener('online', () => {
        if (!this._connect.io.connected && this._connectionCounter <= connectionTriesMax) {
          this._logTechnical(MESSAGES.technical.connection.willReConnect)
          this._connect.io.connect()
        }

        if (!this._connect.io.connected && this._connectionCounter > connectionTriesMax)
          this._logApiWarning(MESSAGES.technical.connection.willNotReconnect)
      })
    }
  }

  protected _destroySocket():void {
    if (this._connect) this._connect.io.destroy()
  }

  private _validateProps(settings: unknown): void {
    try {
      this._logTechnical(makeString(MESSAGES.technical.serviceIs, ['validating settings provided']))
      validateSettings(settings)
    } catch (err) {
      this._logError(makeString(ERRORS.service.gotError, ['validateProps', 'err.message']), err)

      throw new TypeError(err.message)
    }
  }

  private _runAuth(): void {
    this._logTechnical(makeString(MESSAGES.technical.running, ['runAuth']))
    changeType<Promise<AuthDetails>>(this._authSocket())
      .then(async () => {
        this._logTechnical('Service is authed, resetting connectionCounter.')
        this._connectionCounter = 0
        this._logTechnical('Setting lastConnect timestamp.')
        this._lastConnect = getTime()
        await this._connect.get('authentication')
        this.isAuthed = true
        this._onConnect()
      })
      .catch((err) => {
        this._logTechnical(ERRORS.service.failedAuth)
        this.isAuthed = false
        this._connectionCounter++
        this._logTechnical('Setting lastConnect timestamp.')
        this._lastConnect = getTime()
        this._logApiError(ERRORS.connect.on.connect.authSocket, err)
      })
  }

  /**
   * Function to authenticate socket connection. First is tries to
   * re-authenticate. If it's not possible (not done before), then
   * it tries to authenticate.
   */
  private _authSocket(): Promise<AuthenticationResult | void> | undefined {
    this._logTechnical(makeString(MESSAGES.technical.running, ['authSocket']))

    // if no lastConnect or it's been over 10 seconds since last time
    // if () {
    try {
      this._logTechnical('Service (authSocket) is trying to re-authenticate...')

      return this._connect.reAuthenticate().catch(async () => {
        this._logTechnical(makeString(ERRORS.service.failedTo, ['authSocket', 're-authenticate', 'authentication']))
        this._connect
          .authenticate({
            strategy: 'local',
            ...(await authEncrypt({ ...this._auth }, this._sessionId)),
          })
          .catch((err) => {
            // if not
            this._logApiError(ERRORS.connect.authenticate, err)
            this._logTechnical('Set connectionCounter to MAX+1.')
            this._connectionCounter = connectionTriesMax + 1
            this._logTechnical('Set lastConnect timestamp.')
            this._lastConnect = getTime()
          })
      })
    } catch (err) {
      this._logApiError(ERRORS.connect.reAuthenticate, err)
      this._logTechnical('Set connectionCounter to MAX+1.')
      this._connectionCounter = connectionTriesMax + 1
      this._logTechnical('Set lastConnect timestamp.')
      this._lastConnect = getTime()
    }
    // }
  }

  /**
   * Function to run on connection/re-connection processes
   */
  private _onConnect(): void {
    this._log('Service (connect) is ON, requesting latest status...')

    this.getStatus().catch((err) => {
      this._logApiError('Service (onConnect) caught error when calling (getStatus).', err)
    })

    this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['onConnect', 'refreshInbox']))
    this._refreshInbox()
  }

  // TODO: add desc
  private async _refreshInbox(): Promise<void> {
    this._logTechnical(makeString(MESSAGES.technical.running, ['refreshInbox']))

    if (this._lastAddresses && this._lastAddresses.addresses.length) {
      this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['refreshInbox', 'refreshing collects...']))
      let response

      try {
        this._logTechnical(makeString(MESSAGES.technical.requestingData, ['refreshInbox']))
        response = await this._inbox.find({
          query: {
            to: this._lastAddresses.addresses.join(';'),
            ...makeOptions(this._lastAddresses.options, this._watch),
          },
        })
        this._log(makeString(MESSAGES.technical.gotResponse, ['refreshInbox']), response)
      } catch (err) {

        /** log error */
        this._logApiError(makeString(ERRORS.service.gotError, ['refreshInbox', 'request']), err)

        /** throw appropriate error */
        throw makeApiResponseError(err)
      }

      /** return results */

      this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['refreshInbox', 'return']))
      this._useEventBus(EventTypes.GET_COLLECTABLES, response)
    }
  }

  /**
   * Function to assign endpoints to a service
   */
  private _getService(endpoint: Endpoints): ApiService {
    this._logTechnical(makeString(MESSAGES.technical.service, ['getService']), endpoint)

    return this._connect.service(this._makeEndpointPath(endpoint)).hooks({
      before: {
        all: [
          async (context: HookContext) => {
            if (context.params.query) {
              context.params.query = await encrypt(context.params.query, this._sessionId)
            }
          },
        ],
      },
      after: {
        all: [
          async (context: HookContext) => {
            if (context.result) {
              context.result = await decrypt(context.result, this._sessionId)
            }
          },
        ],
      },
      error: {
        all: [
          async (context: HookContext) => {
            if (context.error) {
              context.error = await decrypt(context.error, this._sessionId)
            }
          },
        ],
      },
    })
  }

  /**
   * Function to create endpoints path
   *
   * @param [Endpoints] endpoint - endpoint to use
   *
   * @returns string
   */
  private _makeEndpointPath = (endpoint: Endpoints): string => {
    this._logTechnical(makeString(MESSAGES.technical.endpoint, ['makeEndpointPath']), endpoint)

    const path = `/${version}/${this._currency}/`

    if (isDirect(endpoint)) return path + endpoint

    return path + `${this._network}/${endpoints[endpoint]}`
  }

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
   * or
   *
   * ```typescript
   * service.getStatus({respondDirect: true})
   * ```*
   * -
   */
  public async getStatus(options?: RequestOptions): Promise<Status | void> {
    this._logTechnical(makeString(MESSAGES.technical.running, ['getStatus']))

    /** validate options, if present */
    try {
      if (options) {
        this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getStatus', 'options']))
        validateOptions(options, 'getStatus', true)
      }
    } catch (err) {

      /** log error */
      this._logError(makeString(ERRORS.service.gotError, ['getStatus', 'validation']), err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: Results<NetworkTip>

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getStatus']))
      response = await this._networks.find({ query: { netId: this._network, ...makeOptions(options, this._watch) } })
      this._log(makeString(MESSAGES.technical.gotResponse, ['getStatus']), response)
    } catch (err) {

      /** log error */
      this._logApiError(makeString(ERRORS.service.gotError, ['getStatus', 'request']), err)

      /** throw appropriate error */
      throw makeApiResponseError(err)
    }

    /** return results */

    this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getStatus', 'return']))

    if (shouldReturnDirect(options, this._respondAs)) return response.data[0]

    this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getStatus']))

    this._useEventBus(EventTypes.UPDATE_STATUS, response.data[0])
  }

  public getConnectionStatus(options?: Omit<QueryOptions, 'limit' | 'skip' | 'watch'>): boolean | void {
    this._logTechnical(makeString(MESSAGES.technical.running, ['getConnectionStatus']))

    /** validate options, if present */
    try {
      if (options) {
        this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getConnectionStatus', 'options']))
        validateOptions(options, 'getConnectionStatus')
      }
    } catch (err) {

      /** log error */
      this._logError(makeString(ERRORS.service.gotError, ['getConnectionStatus', 'validation']), err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: boolean

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getConnectionStatus']))
      response = this._connect.io.io.readyState === 'open'
      this._log(makeString(MESSAGES.technical.gotResponse, ['getConnectionStatus']), response)
    } catch (err) {

      /** log error */
      this._logApiError(makeString(ERRORS.service.gotError, ['getConnectionStatus', 'request']), err)

      /** throw appropriate error */
      throw makeReturnError(err.message, err)
    }

    /** return results */

    this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getConnectionStatus', 'return']))

    if (shouldReturnDirect(options, this._respondAs)) return response

    this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getConnectionStatus']))

    this._useEventBus(EventTypes.GET_CONNECTION_STATUS, response)
  }

  public connect(options?: Omit<QueryOptions, 'limit' | 'skip' | 'watch'>): boolean | void {
    this._logTechnical(makeString(MESSAGES.technical.running, ['connect']))

    /** validate options, if present */
    try {
      if (options) {
        this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['connect', 'options']))
        validateOptions(options, 'connect')
      }
    } catch (err) {

      /** log error */
      this._logError(makeString(ERRORS.service.gotError, ['connect', 'validation']), err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: boolean

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['connect']))
      this._socket.connect().open()
      response = true
      this._manuallyDisconnected = false
      this._log(makeString(MESSAGES.technical.gotResponse, ['connect']), response)
    } catch (err) {

      /** log error */
      this._logApiError(makeString(ERRORS.service.gotError, ['connect', 'request']), err)

      /** throw appropriate error */
      throw makeReturnError(err.message, err)
    }

    /** return results */

    this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['connect', 'return']))

    if (shouldReturnDirect(options, this._respondAs)) return response

    this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['connect']))

    this._useEventBus(EventTypes.CONNECT, response)
  }
}

export { Connect }
