import feathers, { Application } from '@feathersjs/feathers'
import io from 'socket.io-client'
import socketio from '@feathersjs/socketio-client'

import os from 'os'

import { ConfigProps } from '.'
import {
  DebugLevels,
  Currencies,
  Networks,
  Settings,
  Endpoints,
  LoggerProps,
  Logger,
  ApiService,
  NetworkTip,
  Status,
  ApiResponseError,
  EventBus,
  Responses,
  EventTypes,
  Retrievable,
  ResponseCollectable,
} from './types'

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

  // settings
  private _debug: DebugLevels
  private _currency: Currencies
  private _network: Networks
  private _connect: Application<any>
  private _response: Responses

  private _eventBus: EventBus
  private _networks: ApiService

  constructor({ debug, network, currency, eventBus, respond, refreshInbox }: ConfigProps) {
    const isDev = process.env.NODE_ENV === 'development'
    this._debug = debug ? debug : isDev ? DebugLevels.VERBOSE : DebugLevels.QUIET
    this._currency = currency ? currency : Currencies.Bitcoin
    this._network = network ? network : Networks.Testnet
    this._eventBus = eventBus ? eventBus : event => {}
    this._response = respond ? respond : Responses.Direct

    // setup
    const socket = io(this._url)

    console.log(refreshInbox)

    this._connect = feathers().configure(socketio(socket))

    this._networks = this.getService(Endpoints.Networks)

    // connect/disconnect
    try {
      socket.on('connect', (): void => {
        this._log({
          type: Logger.Info,
          message: 'Service (connect) is ON.',
        })
        this.getStatus()
        if (refreshInbox) refreshInbox()
      })
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

  private _respond = (type: EventTypes, payload: Status) => {
    if (this._response === Responses.Direct) return payload
    if (this._response === Responses.Callback) this._eventBus({ type, payload })
  }

  private _makeEndpointPath = (endpoint: Endpoints) => {
    const path = `/${this._VERSION}/${this._currency}/`
    if (endpoint === Endpoints.Networks) return path + endpoint
    return path + `${this._network}/${this._endpoints[endpoint]}`
  }

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

  public getService = (endpoint: Endpoints) => this._connect.service(this._makeEndpointPath(endpoint))

  public getSettings = (): Settings => ({
    debug: this._debug,
    currency: this._currency,
    network: this._network,
    version: this._VERSION,
  })

  // used on connect/reconnect
  public getStatus = () =>
    this._networks
      .get(this._network)
      .then((response: NetworkTip) => {
        const payload: Status = { height: response.height, online: response.online }
        this._log({ type: Logger.Info, payload, message: 'Service (getStatus): ' })
        return this._respond(EventTypes.UPDATE_STATUS, payload)
      })
      .catch((e: ApiResponseError) => {
        if (this._response === Responses.Direct) throw new Error(e.message)
        this._log({ type: Logger.Error, message: `Service (getStatus) got an error: ${e.message || 'unknown'}` })
      })
}

export default Config
