import { ERRORS } from '../text';
import { Currencies } from '../types';
import { makeString } from './other';

export const invalidAddress = (currency: Currencies): string =>
  makeString(ERRORS.validation.invalidAddress, [String(currency).toUpperCase()]);
