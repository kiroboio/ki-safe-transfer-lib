import { RequestOptions } from './api';

enum RatesSources {
  BITFINEX = 'bitfinex.com',
  BLOCKCHAIN = 'blockchain.info',
  COINGECKO = 'coingecko.com',
}

interface GetRatesProps {
  source?: RatesSources;
  options?: RequestOptions;
}

interface ExchangeRate {
  source: RatesSources;
  timestamp: number;
  online: boolean;
  value: number;
}

export { ExchangeRate, GetRatesProps, RatesSources };
