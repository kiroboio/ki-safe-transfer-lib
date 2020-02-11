import feathers, { Application } from '@feathersjs/feathers'
import io from 'socket.io-client'
import socketio from '@feathersjs/socketio-client'

import { capitalize } from './tools'

import { ConfigProps, Currencies, DebugLevels, Endpoints, Logger, LoggerFunction, Networks, Settings } from './types'

// TODO: add comments
class Config {
  // fixed
  protected _VERSION = 'v1'
  protected _url = 'http://3.92.123.183'
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
  private _connect: Application<any>
  private _getStatus: () => any
  private _logger: LoggerFunction

  constructor({ debug, network, currency, logger, getStatus, refreshInbox }: ConfigProps) {
    this._debug = this._debugLevelSelector(debug)
    this._currency = currency ? currency : Currencies.Bitcoin
    this._network = network ? network : Networks.Testnet
    this._getStatus = getStatus ? getStatus : () => {}
    this._logger = logger ? logger : ({}) => {}

    // setup
    const socket = io(this._url)

    this._connect = feathers().configure(socketio(socket))

    // connect/disconnect
    try {
      socket.on('connect', (): void => {
        this._logger({
          type: Logger.Info,
          message: 'Service (connect) is ON.',
        })
        this._getStatus()
        if (refreshInbox) refreshInbox()
      })
    } catch (e) {
      this._logger({
        type: Logger.Error,
        message: `Service (connect) got an error. ${e.message || ''}`,
      })
    }

    try {
      socket.on('disconnect', (payload: any) =>
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
            if (!socket.connected) socket.connect()
          })
          .catch(() => {
            if (socket.connected) socket.disconnect()
          })
      }, 3000)
    } else {
      //  this is web
      window.addEventListener('offline', () => {
        if (socket.connected) socket.disconnect()
      })
      window.addEventListener('online', () => {
        if (!socket.connected) socket.connect()
      })
    }
  }

  private _debugLevelSelector = (debug: DebugLevels | undefined) => {
    if (debug) return debug
    if (this._isTest) return DebugLevels.MUTE
    if (this._isDev) return DebugLevels.VERBOSE
    return DebugLevels.QUIET
  }

  private _makeEndpointPath = (endpoint: Endpoints) => {
    const path = `/${this._VERSION}/${this._currency}/`
    if (endpoint === Endpoints.Networks) return path + endpoint
    return path + `${this._network}/${this._endpoints[endpoint]}`
  }

  public getService = (endpoint: Endpoints) => this._connect.service(this._makeEndpointPath(endpoint))

  public getSettings = (): Settings => ({
    debug: this._debug,
    currency: this._currency,
    network: this._network,
    version: this._VERSION,
  })
}

export default Config
