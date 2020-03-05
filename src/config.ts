/* eslint-disable no-console */
import feathers, { Application } from '@feathersjs/feathers'
import io from 'socket.io-client'
import socketio from '@feathersjs/socketio-client'
import {AuthenticationResult} from '@feathersjs/authentication'
import auth from '@feathersjs/authentication-client'

import { capitalize } from './tools'

import {
  ConfigProps,
  Currencies,
  DebugLevels,
  Endpoints,
  Logger,
  LoggerFunction,
  Networks,
  Settings,
  Switch,
  SwitchActions,
  AuthDetails,
} from './types'

class Config {
  // fixed
  protected _VERSION = 'v1'

  protected _url = 'https://api.kirobo.me'

  protected _endpoints = {
    collect: 'transfer/action/collect',
    inbox: 'transfer/inbox',
    transfers: 'transfers',
  }

  private _isDev = process.env.NODE_ENV === 'development'

  private _isTest = process.env.NODE_ENV === 'test'

  // settings
  private _debug: DebugLevels

  private _currency: Currencies

  private _network: Networks

  private _auth: AuthDetails = { key: '', secret: '' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _connect: Application<any>

  private _socket: SocketIOClient.Socket

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _getStatus: () => any

  private _refresh: () => void

  private _logger: LoggerFunction

  constructor({ debug, network, currency, logger, getStatus, refreshInbox, authDetails }: ConfigProps) {
    this._debug = this._debugLevelSelector(debug)
    this._currency = currency ? currency : Currencies.Bitcoin
    this._network = network ? network : Networks.Testnet
    this._getStatus = getStatus
      ? getStatus
      : (): void => {
          return
        }
    this._logger = logger
      ? logger
      : // eslint-disable-next-line no-empty-pattern
        ({}): void => {
          return
        }
    this._auth = authDetails
    this._refresh = refreshInbox

    // setup
    this._socket = io(this._url)

    const connect = feathers().configure(socketio(this._socket))

    this._connect = connect.configure(auth({ storageKey: 'auth' }))

    this._authSocket()

    // connect/disconnect
    try {
      this._connect.io.on('connect', (): void => {
        this._authSocket()
          .then(() => this._onConnect())
          .catch(e => console.log(e))
      })
    } catch (e) {
      this._logger({
        type: Logger.Error,
        message: `Service (connect) got an error. ${e.message || ''}`,
      })
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this._connect.io.on('disconnect', (payload: any) =>
        this._logger({
          type: Logger.Warning,
          message: 'Service (disconnect) is OFF.',
          payload: capitalize(payload),
        }),
      )
    } catch (e) {
      this._logger({
        type: Logger.Error,
        message: `Service (disconnect) got an error. ${e.message || ''}`,
      })
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

  private _debugLevelSelector = (debug: DebugLevels | undefined): DebugLevels => {
    if (debug === 0 || debug === 1 || debug === 2) return debug

    if (this._isTest) return DebugLevels.MUTE

    if (this._isDev) return DebugLevels.VERBOSE

    return DebugLevels.QUIET
  }

  private _makeEndpointPath = (endpoint: Endpoints): string => {
    const path = `/${this._VERSION}/${this._currency}/`

    if (endpoint === Endpoints.Networks) return path + endpoint

    return path + `${this._network}/${this._endpoints[endpoint]}`
  }

  public _authSocket = (): Promise<void | AuthenticationResult> =>
    this._connect
      .reAuthenticate()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch(_e => {
        this._connect
          .authenticate({
            strategy: 'local',
            key: this._auth.key || '',
            secret: this._auth.secret || '',
          })
          .catch((err: { message: string }) => {
            // if not
            throw new Error(`Authentication error (${err.message}).`)
          })
      })

  private _onConnect = (): void => {
    this._logger({
      type: Logger.Info,
      message: 'Service (connect) is ON.',
    })
    this._getStatus()

    if (this._refresh) this._refresh()
  }

  public getService = (endpoint: Endpoints) => this._connect.service(this._makeEndpointPath(endpoint))

  public getSettings = (): Settings => ({
    debug: this._debug,
    currency: this._currency,
    network: this._network,
    version: this._VERSION,
  })

  public switch = ({ action, value }: Switch): boolean | void => {
    // if status is requested -> return status
    if (action === SwitchActions.STATUS) return this._socket.connected

    // if connect/disconnect
    if (action === SwitchActions.CONNECT) {
      // if value is provided and is not equal to status of connection
      // proceed as per request

      if (typeof value !== 'undefined' && value !== this._socket.connected)
        value ? this._socket.connect() : this._socket.disconnect()
      // if value is not provided -> toggle connection
      else if (typeof value === 'undefined') {
        if (!this._socket.connected) {
          this._socket.connect()
        } else {
          this._socket.disconnect()
        }
      }
    }
  }
}

export { Config }
