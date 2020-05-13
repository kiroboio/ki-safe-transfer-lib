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
  Retrievable,
} from './types'
import { Base } from './base'
import { debugLevelSelector } from './tools/debug'
import { apiUrl, version, endpoints, connectionTriesMax } from './config'
import { capitalize } from './tools'
import { WARNINGS, ERRORS } from './text'
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
        ;(this._authSocket() as Promise<AuthDetails>)
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
      const { height, online, fee } = data

      this._useEventBus(EventTypes.UPDATE_STATUS, { height, online, fee })
    })

    // retrievable updated
    this._transfers.on('patched', (payload: Retrievable) => {
      this._useEventBus(EventTypes.UPDATED_RETRIEVABLE, payload)
    })

    // collectable removed
    this._transfers.on('removed', (payload: Collectable) => {
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
    if (this._lastAddresses && this._lastAddresses.length) {
      let data

      try {
        data = await this._inbox.find({ query: { to: this._lastAddresses.join(';') } })
      } catch (err) {
        throw makeApiResponseError(err)
      }

      this._useEventBus(EventTypes.GET_COLLECTABLES, data)
    }
  }

  /**
   * Function to assign endpoints to a service
   */
  private _getService(endpoint: Endpoints): ApiService {
    this._logTechnical('Service gets API service (getService):', endpoint)

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
    this._logTechnical('Service is making endpoint (makeEndpointPath):', endpoint)

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
    this._logTechnical('Service is requesting status (getStatus).')
    let response: NetworkTip

    /** make request */
    try {
      response = await this._networks.get(this._network)
      this._log('Service (getStatus) got response:', response)
    } catch (err) {
      throw makeApiResponseError(err)
    }

    /** return results */
    const payload: Status = {
      height: response.height,
      online: response.online,
      fee: response.fee,
    }

    if (shouldReturnDirect(options, this._respondAs)) return payload

    this._useEventBus(EventTypes.UPDATE_STATUS, payload)
  }

  public getConnectionStatus(options?: Omit<QueryOptions, 'limit' | 'skip'>): boolean | void {
    this._logTechnical('Service is requesting connection status (getConnectionStatus).')

    /** validate options, if present */
    try {
      if (options) {
        validateOptions(options, 'getConnectionStatus')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (getConnectionStatus) caught [validation] error.', err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: boolean

    /** make request */
    try {
      response = this._socket.connected
      this._logTechnical('Service (getConnectionStatus) got response:', response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }

    /** return results */

    if (shouldReturnDirect(options, this._respondAs)) return response

    this._useEventBus(EventTypes.GET_CONNECTION_STATUS, response)
  }

  public disconnect(options?: Omit<QueryOptions, 'limit' | 'skip'>): boolean | void {
    this._logTechnical('Service is disconnecting (disconnect).')

    /** validate options, if present */
    try {
      if (options) {
        validateOptions(options, 'disconnect')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (disconnect) caught [validation] error.', err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: boolean

    /** make request */
    try {
      response = this._socket.disconnect().disconnected
      this._logTechnical('Service (disconnect) got response:', response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }

    /** return results */

    if (shouldReturnDirect(options, this._respondAs)) return response

    this._useEventBus(EventTypes.DISCONNECT, response)
  }

  public connect(options?: Omit<QueryOptions, 'limit' | 'skip'>): boolean | void {
    this._logTechnical('Service is connecting (connect).')

    /** validate options, if present */
    try {
      if (options) {
        validateOptions(options, 'connect')
      }
    } catch (err) {

      /** log error */
      this._logError('Service (connect) caught [validation] error.', err)

      /** throw appropriate error */
      throw makePropsResponseError(err)
    }

    let response: boolean

    /** make request */
    try {
      response = this._socket.connect().connected
      this._logTechnical('Service (connect) got response:', response)
    } catch (err) {
      throw makeReturnError(err.message, err)
    }

    /** return results */

    if (shouldReturnDirect(options, this._respondAs)) return response

    this._useEventBus(EventTypes.CONNECT, response)
  }
}

export { Connect }
