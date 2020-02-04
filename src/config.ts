import { ConfigProps } from '.'
import { DebugLevels, Currencies, Networks, Settings } from './types'

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

  constructor({ debug, network, currency }: ConfigProps) {
    this._debug = debug ? debug : DebugLevels.MUTE
    this._currency = currency ? currency : Currencies.Bitcoin
    this._network = network ? network : Networks.Testnet
  }

  public _getSettings = (): Settings => ({
    debug: this._debug,
    currency: this._currency,
    network: this._network,
    version: this._VERSION,
  })

  // public _setSettings = ({ debug, network, currency }: ConfigProps) => {
  //   if (debug && debug !== this._debug) this._debug = debug
  //   if (currency && currency !== this._currency) this._currency = currency
  //   if (network && network !== this._network) this._network = network
  // }
}

export default Config
