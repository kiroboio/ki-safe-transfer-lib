import Config from './config'
import { ServiceProps, Settings } from './types'



class Service {
  private _settings:Settings;

  constructor(settings: ServiceProps | {}) {
    const { debug, currency, network } = settings as ServiceProps
    const config = new Config({ debug, currency, network })
    this._settings = config._getSettings()
  }

  public getSettings = () => this._settings

}

export * from './types'
export default Service
