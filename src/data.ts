import { KeyObject } from './types'

export const TEXT = {
  validation: {
    cantBe: '%1 can\'t be %2. It should be %3.',
    params: '%1 in params of "%2" method can\'t be %3. It should be %4.',
    empty: '%1 in params of "%2" method can\'t be empty.',
    notAddress: '%1 in param of "%2" method is not a valid address. Crypto settings: %3',
  },
  errors: {
    validation: {
      missingArgument: 'Data is missing',
      emptyObject: 'Settings object can\'t be empty.',
      emptyGenObject: '%1 object can\'t be empty',
      extraKeys: 'Extra keys present in settings.',
      extraGenKeys: 'Extra keys present in %1.',
      noArray: 'Argument can\'t be an Array.',
      noFunction: 'Argument can\'t be a function.',
      typeOfObject: 'Wrong type of argument',
      unknownKeys: 'Unknown key in settings: ',
      unknownGenKeys: 'Unknown key in %1 ',
      wrongValueType: 'Key \'%1\' in settings has value of wrong type. Should be: %2.',
      wrongGenValueType: 'Key \'%1\' in %2 has value of wrong type: %3. Should be %4.',
      wrongValue: 'Wrong value \'%1\' for key \'%2\' in settings. Should be one of: %3.',
      wrongGenValue: 'Wrong value \'%1\' for key \'%2\' in %3. Should be %4.',
      malformedData: 'Data is malformed.',
      malformedAddress: 'Malformed address: %1.',
      missingValues: 'Missing values: ',
      malformedValues: 'Malformed values: ',
    },
  },
}

export const listOfStatusKeys = ['height', 'online', 'fee', 'netId', 'timestamp','updatedAt']

export const typeOfStatusValues: KeyObject<string> = {
  height: 'number',
  online: 'boolean',
  fee: 'number',
  netId: 'string',
  timestamp: 'number',
  updatedAt: 'string'
}

export const listOfSettingsKeys = ['debug', 'currency', 'network', 'eventBus', 'respondAs', 'authDetails']

export const typeOfSettingsKeys: KeyObject<string> = {
  debug: 'number',
  currency: 'string',
  network: 'string',
  eventBus: 'function',
  respondAs: 'string',
  authDetails: 'object',
}

export const valuesForSettings: KeyObject<(string | number)[]> = {
  currency: ['btc'],
  network: ['testnet', 'regtest', 'main'],
  debug: [0, 1, 2, 4],
  respondAs: ['callback', 'direct'],
}

export const authDetailsData: KeyObject<string> = {
  key: 'string',
  secret: 'string',
}


interface ValidType {
  [index: string]: { type: string; values?: string[] }
}

export const optionsValidValues: ValidType = {
  skip: { type: 'number' },
  limit: { type: 'number' },
  respondDirect: { type: 'boolean' },
}
