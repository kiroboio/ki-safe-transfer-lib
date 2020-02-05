import feathers, { Application } from '@feathersjs/feathers'
import io from 'socket.io-client'
import socketio from '@feathersjs/socketio-client'

import os from 'os'

import { ConfigProps } from '.'
import { DebugLevels, Currencies, Networks, Settings, Endpoints, LoggerProps, Logger } from './types'

class Config {
  // fixed
  protected _VERSION = 'v1'
  protected _url = 'http://3.92.123.183'
  protected _endpoints = {
    collect: 'transfer/action/collect',
    inbox: 'transfer/inbox',
    transfers: 'transfers',
  }

  // settings
  private _debug: DebugLevels
  private _currency: Currencies
  private _network: Networks
  private _connect: Application<any>

  constructor({ debug, network, currency }: ConfigProps) {
    const isDev = process.env.NODE_ENV === 'development'
    this._debug = debug ? debug : isDev ? DebugLevels.VERBOSE : DebugLevels.QUIET
    this._currency = currency ? currency : Currencies.Bitcoin
    this._network = network ? network : Networks.Testnet

    // setup
    const socket = io(this._url)

    this._connect = feathers().configure(socketio(socket))

    // connect/disconnect
    try {
      socket.on('connect', (): void =>
        this._log({
          type: Logger.Info,
          message: 'Service (connect) is ON.',
        }),
      )
    } catch (e) {
      this._log({
        type: Logger.Error,
        message: `Service (connect) got an error. ${e.message || ''}`,
      })
    }

    try {
      socket.on('disconnect', (payload: any) =>
        this._log({
          type: Logger.Warning,
          message: 'Service (disconnect) is OFF.',
          payload,
        }),
      )
    } catch (e) {
      this._log({
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

  public getSettings = (): Settings => ({
    debug: this._debug,
    currency: this._currency,
    network: this._network,
    version: this._VERSION,
  })

  private _makeEndpointPath = (endpoint: Endpoints) => {
    const path = `/${this._VERSION}/${this._currency}/`
    if (endpoint === Endpoints.Networks) return path + endpoint
    return path + `${this._network}/${this._endpoints[endpoint]}`
  }

  public getService = (endpoint: Endpoints) => this._connect.service(this._makeEndpointPath(endpoint))

  private _log = ({ type, payload, message }: LoggerProps) => {
    // if not MUTE mode
    if (this._debug !== DebugLevels.MUTE) {
      // errors are shown in all other modes
      if (!type) console.error(message)
      if (type === 2) payload ? console.warn(message, payload) : console.warn(message)
      // info is shown only in verbose mode
      else if (type === 1 && this._debug === DebugLevels.VERBOSE)
        payload ? console.log(message, payload) : console.log(message)
    }
  }
}

export default Config
