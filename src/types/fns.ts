import { Currencies, Endpoints, Networks } from './enums';

export interface MakeServiceParameters {
  currency: Currencies;
  network: Networks;
  endpoint: Endpoints;
}
