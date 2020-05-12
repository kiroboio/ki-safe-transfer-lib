import feathers, { Application } from '@feathersjs/feathers'
import io from 'socket.io-client'
import socket from '@feathersjs/socketio-client'
import { AuthenticationResult } from '@feathersjs/authentication'
import auth from '@feathersjs/authentication-client'

import {
  AuthDetails,
  Networks,
  Currencies,
  ConnectProps,
  QueryOptions,
  Status,
  NetworkTip,
  ApiService,
  Endpoints,
  Responses,
  EventBus,
  Event,
  EventTypes,
} from './type'
import { authDetailsDefaults } from './defaults'
import { Base } from './base'
import { debugLevelSelector } from './tools/debug'
import { apiUrl, version, endpoints } from './conf'
import { capitalize } from './tools'
import { WARNINGS, ERRORS } from './text'
import { makeApiResponseError } from './tools/error'
import { shouldReturnDirect, isDirect } from './tools/connect'

class Connect extends Base {
  private _connect: Application<unknown>

  private _socket: SocketIOClient.Socket

  private _networks: ApiService

  constructor({ debug, network, currency, authDetails, eventBus, respondAs }: ConnectProps) {
    super(debugLevelSelector(debug))

    if (currency && currency !== this._currency) this._currency = currency

    if (network && network !== this._network) this._network = network

    this._auth = authDetails

    if (respondAs && respondAs !== this._respondAs) this._respondAs = respondAs

    if (eventBus) this._eventBus = eventBus

    // setup
    this._socket = io(apiUrl)

    const connect = feathers().configure(
      socket(this._socket, {
        timeout: 10000,
      }),
    )

    this._connect = connect.configure(auth({ storageKey: 'auth' }))

    // TODO: refactor
    this._authSocket()?.catch(err => this._logApiError(ERRORS.connect.authSocket, err))

    /** assign services */

    this._networks = this._getService(Endpoints.Networks)

    // connect/disconnect
    try {
      this._connect.io.on('connect', (): void => {
        (this._authSocket() as Promise<AuthDetails>)
          .then(() => this._onConnect())
          .catch(err => this._logApiError(ERRORS.connect.on.connect.authSocket, err))
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

    // set internet connection check
    if (typeof window === 'undefined') {
      // this is backend
      setInterval(() => {
        require('dns')
          .promises.lookup('google.com')
          .then(() => {
            if (!this._connect.io.connected) this._connect.io.connect()
          })
          .catch(() => {
            if (this._connect.io.connected) this._connect.io.disconnect()
          })
      }, 3000)
    } else {
      //  this is web
      window.addEventListener('offline', () => {
        if (this._connect.io.connected) this._connect.io.disconnect()
      })
      window.addEventListener('online', () => {
        if (!this._connect.io.connected) this._connect.io.connect()
      })
    }
  }

  /**
   * Function to authenticate socket connection. First is tries to
   * re-authenticate. If it's not possible (not done before), then
   * it tries to authenticate.
   */
  private _authSocket(): Promise<AuthenticationResult | void> | undefined {
    try {
      return this._connect.reAuthenticate().catch(() => {
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
    this._log('Service (connect) is ON.')

    this.getStatus().catch(err => {
      this._logApiError('Service (onConnect) caught error when calling (getStatus).', err)
    })

    // if (this._refresh) this._refresh()
  }

  // private _refresh() {}

  /**
   * Function to assign endpoints to a service
   */
  private _getService = (endpoint: Endpoints): ApiService => this._connect.service(this._makeEndpointPath(endpoint))

  /**
   * Function to create endpoints path
   *
   * @param [Endpoints] endpoint - endpoint to use
   *
   * @returns string
   */
  private _makeEndpointPath = (endpoint: Endpoints): string => {
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
  public getStatus = async (options?: Omit<QueryOptions, 'limit' | 'skip'>): Promise<Status | void> => {
    let response: NetworkTip

    /** make request */
    try {
      response = await this._networks.get(this._network)
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
}

export { Connect }
