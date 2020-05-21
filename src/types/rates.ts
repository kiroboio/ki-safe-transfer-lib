import { QueryOptions, RequestOptions } from './api'

enum RatesProviders {
  BITFINEX = 'bitfinex.com',
  BLOCKCHAIN = 'blockchain.info',
  COINGECKO = 'coingecko.com',
}

interface GetRatesProps {
  provider?: RatesProviders
  options?: RequestOptions
}

interface ExchangeRate {
  source: RatesProviders
  timestamp: number
  online: boolean
  value: number
}

export { ExchangeRate, GetRatesProps, RatesProviders }
