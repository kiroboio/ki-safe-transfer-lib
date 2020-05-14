import feathers, { Application } from '@feathersjs/feathers'
import io from 'socket.io-client'
import socket from '@feathersjs/socketio-client'
import { AuthenticationResult } from '@feathersjs/authentication'
import auth from '@feathersjs/authentication-client'

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
} from './types'
import { Base } from './base'
import { debugLevelSelector } from './tools/debug'
import { apiUrl, version, endpoints, connectionTriesMax } from './config'
import { capitalize, makeString } from './tools'
import { WARNINGS, ERRORS, MESSAGES } from './text'
import { makeApiResponseError, makeReturnError, makePropsResponseError } from './tools/error'
import { shouldReturnDirect, isDirect } from './tools/connect'
import { validateOptions, validateSettings } from './validators'

class Connect extends Base {
  private _connect: Application<unknown>

  private _socket: SocketIOClient.Socket

  protected _connectionCounter = 0

  protected _networks: ApiService

  protected _transfers: ApiService

  protected _inbox: ApiService

  protected _collect: ApiService

  protected _utxos: ApiService

  protected _exists: ApiService

  protected _rateBtcToUsd: ApiService

  protected _retrieve: ApiService

  constructor(props: ConnectProps) {
    super(debugLevelSelector(props?.debug))

    this._logTechnical('Service (connect > constructor) sent \'debug\' setting to super, validating props')

    this._validateProps(props)

    const { network, currency, authDetails, eventBus, respondAs } = props

    this._logTechnical('Service (connect > constructor) assigns instance variables')

    if (currency && currency !== this._currency) this._currency = currency

    if (network && network !== this._network) this._network = network

    if (respondAs && respondAs !== this._respondAs) this._respondAs = respondAs

    this._auth = authDetails

    if (eventBus) this._eventBus = eventBus

    // setup

    this._logTechnical('Service is configuring connection...')
    this._socket = io(apiUrl)

    const connect = feathers().configure(
      socket(this._socket, {
        timeout: 10000,
      }),
    )

    this._connect = connect.configure(auth({ storageKey: 'auth' }))

    // TODO: refactor
    this._logTechnical('Service is calling authentication method...')
    this._authSocket()?.catch(err => this._logApiError(ERRORS.connect.authSocket, err))

    // assign services
    this._logTechnical('Service is setting up API services...')
    this._networks = this._getService(Endpoints.Networks)
    this._transfers = this._getService(Endpoints.Transfers)
    this._inbox = this._getService(Endpoints.Inbox)
    this._collect = this._getService(Endpoints.Collect)
    this._utxos = this._getService(Endpoints.Utxos)
    this._exists = this._getService(Endpoints.Exists)
    this._rateBtcToUsd = this._getService(Endpoints.RateToUsd)
    this._retrieve = this._getService(Endpoints.Retrieve)

    // connect/disconnect event processes
    this._logTechnical('Service is setting up event listeners...')

    try {
      this._connect.io.on('connect', (): void => {
        this._logTechnical('Service is connected, proceeding with authorization...')

        if (this._connectionCounter <= connectionTriesMax) {
          (this._authSocket() as Promise<AuthDetails>)
            .then(() => {
              this._logTechnical('Service is authed, resetting connectionCounter.')
              this._connectionCounter = 0
              this._onConnect()
            })
            .catch(err => {
              this._logTechnical('Service failed to authenticate, updating connectionCounter.')
              this._connectionCounter++
              this._logApiError(ERRORS.connect.on.connect.authSocket, err)
            })
        } else {
          this._logTechnical(
            `Service (connect) exceeded MAX connection tries (${connectionTriesMax}) and will halt the reconnection efforts.`,
          )
        }
      })
    } catch (err) {
      this._logApiError(ERRORS.connect.on.connect.direct, err)
    }

    try {
      this._connect.io.on('disconnect', (payload: string) =>
        this._logApiWarning(WARNINGS.connect.disconnect, capitalize(payload)),
      )
    } catch (err) {
      this._logApiError(ERRORS.connect.on.disconnect.direct, err)
    }

    // status update
    this._networks.on('patched', (data: NetworkTip) => {
      this._useEventBus(EventTypes.UPDATE_STATUS, data)
    })

    // transfer updated
    this._transfers.on('patched', (payload: Transfer) => {
      this._useEventBus(EventTypes.UPDATED_RETRIEVABLE, payload)
    })

    // transfer removed
    this._transfers.on('removed', (payload: Transfer) => {
      this._useEventBus(EventTypes.REMOVED_RETRIEVABLE, payload)
    })

    // new collectable has been created for the previously requested address
    this._inbox.on('created', (payload: Collectable) => {
      this._useEventBus(EventTypes.CREATED_COLLECTABLE, payload)
    })

    // collectable patched
    this._inbox.on('patched', (payload: Collectable) => {
      this._useEventBus(EventTypes.UPDATED_COLLECTABLE, payload)
    })

    // collectable removed
    this._inbox.on('removed', (payload: Collectable) => {
      this._useEventBus(EventTypes.REMOVED_COLLECTABLE, payload)
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
              this._logTechnical('Connection is online, but service is not -  will re-connect.')
              this._connect.io.connect()
            }

            if (this._connectionCounter > connectionTriesMax)
              this._logApiWarning('Service exceeded connectionTriesMax.')
          })
          .catch(() => {
            if (this._connect.io.connected) {
              this._logTechnical('Connection is offline, but service is not - will disconnect.')
              this._connect.io.disconnect()
            }
          })
      }, 3000)
    } else {
      //  this is web
      window.addEventListener('offline', () => {
        if (this._connect.io.connected) {
          this._logTechnical('Browser connection is offline, but service is not - will disconnec.')

          this._connect.io.disconnect()
        }
      })
      window.addEventListener('online', () => {
        if (!this._connect.io.connected && this._connectionCounter <= connectionTriesMax) {
          this._logTechnical('Browser connection is online,but service is not - will re-connect.')
          this._connect.io.connect()
        }

        if (!this._connect.io.connected && this._connectionCounter > connectionTriesMax)
          this._logApiWarning(
            'Browser connection is online, but service is not - service exceeded connectionTriesMax, will not re-connect.',
          )
      })
    }
  }

  private _validateProps(settings: unknown): void {
    try {
      this._logTechnical('Service is validating settings provided...')
      validateSettings(settings)
    } catch (err) {
      this._logError(`Service (validateProps) got an error. ${err.message}`, err)

      throw new TypeError(err.message)
    }
  }

  /**
   * Function to authenticate socket connection. First is tries to
   * re-authenticate. If it's not possible (not done before), then
   * it tries to authenticate.
   */
  private _authSocket(): Promise<AuthenticationResult | void> | undefined {
    try {
      this._logTechnical('Service is trying to re-authenticate (authSocket).')
      return this._connect.reAuthenticate().catch(() => {
        this._logTechnical('Service failed to re-authenticate, proceeding with authentication (authSocket).')
        this._connect
          .authenticate({
            strategy: 'local',
            ...this._auth,
          })
          .catch(err => {
            // if not
            this._logApiError(ERRORS.connect.authenticate, err)
          })
      })
    } catch (err) {
      this._logApiError(ERRORS.connect.reAuthenticate, err)
    }
  }

  /**
   * Function to run on connection/re-connection processes
   */
  private _onConnect(): void {
    this._log('Service (connect) is ON, requesting latest status...')

    this.getStatus().catch(err => {
      this._logApiError('Service (onConnect) caught error when calling (getStatus).', err)
    })

    this._refreshInbox()
  }

  // TODO: add desc
  private async _refreshInbox(): Promise<void> {
    this._logTechnical(makeString(MESSAGES.technical.running, ['connect']))

    if (this._lastAddresses && this._lastAddresses.length) {
        this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['connect','']))
      let response

      try {
         this._logTechnical(makeString(MESSAGES.technical.requestingData, ['connect']))
        response = await this._inbox.find({ query: { to: this._lastAddresses.join(';') } })
         this._log(makeString(MESSAGES.technical.gotResponse, ['connect']), response)
      } catch (err) {
        throw makeApiResponseError(err)
      }

      this._useEventBus(EventTypes.GET_COLLECTABLES, response)
    }
  }

  /**
   * Function to assign endpoints to a service
   */
  private _getService(endpoint: Endpoints): ApiService {
    this._logTechnical(makeString(MESSAGES.technical.service,['getService']), endpoint)

    return this._connect.service(this._makeEndpointPath(endpoint))
  }

  /**
   * Function to create endpoints path
   *
   * @param [Endpoints] endpoint - endpoint to use
   *
   * @returns string
   */
  private _makeEndpointPath = (endpoint: Endpoints): string => {
    this._logTechnical(makeString(MESSAGES.technical.endpoint,['makeEndpointPath']), endpoint)

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
  public async getStatus(options?: Omit<QueryOptions, 'limit' | 'skip'>): Promise<Status | void> {
    this._logTechnical(makeString(MESSAGES.technical.running, ['getStatus']))

    /** validate options, if present */
    try {
      if (options) {
        this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['getStatus', 'options']))
        validateOptions(options, 'getStatus')
      }
    } catch (err) {

      /** log error */
      this._logError(makeString(ERRORS.service.gotError, ['getStatus', 'validation']), err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: NetworkTip

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['getStatus']))
      response = await this._networks.get(this._network)
      this._log(makeString(MESSAGES.technical.gotResponse, ['getStatus']), response)
    } catch (err) {

      /** log error */
      this._logApiError(makeString(ERRORS.service.gotError, ['getStatus', 'request']), err)

      /** throw appropriate error */
      throw makeApiResponseError(err)
    }

    /** return results */

    this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['getStatus', 'return']))

    if (shouldReturnDirect(options, this._respondAs)) return response

    this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['getStatus']))

    this._useEventBus(EventTypes.UPDATE_STATUS, response)
  }

  public getConnectionStatus(options?: Omit<QueryOptions, 'limit' | 'skip'>): boolean | void {
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
      response = this._socket.connected
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

  public disconnect(options?: Omit<QueryOptions, 'limit' | 'skip'>): boolean | void {
    this._logTechnical(makeString(MESSAGES.technical.running, ['disconnect']))

    /** validate options, if present */
    try {
      if (options) {
        this._logTechnical(makeString(MESSAGES.technical.foundAndChecking, ['disconnect', 'options']))
        validateOptions(options, 'disconnect')
      }
    } catch (err) {

      /** log error */
      this._logError(makeString(ERRORS.service.gotError, ['disconnect', 'validation']), err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: boolean

    /** make request */
    try {
      this._logTechnical(makeString(MESSAGES.technical.requestingData, ['disconnect']))
      response = this._socket.disconnect().disconnected
      this._log(makeString(MESSAGES.technical.gotResponse, ['disconnect']), response)
    } catch (err) {

      /** log error */
      this._logApiError(makeString(ERRORS.service.gotError, ['disconnect', 'request']), err)

      /** throw appropriate error */
      throw makeReturnError(err.message, err)
    }

    /** return results */

    this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['disconnect', 'return']))

    if (shouldReturnDirect(options, this._respondAs)) return response

    this._logTechnical(makeString(MESSAGES.technical.willReplyThroughBus, ['disconnect']))

    this._useEventBus(EventTypes.DISCONNECT, response)
  }

  public connect(options?: Omit<QueryOptions, 'limit' | 'skip'>): boolean | void {
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
      response = this._socket.connect().connected
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
