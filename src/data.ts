import { DataSpec } from './types'

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

export const listOfStatusKeys = ['height', 'online', 'fee', 'fees', 'relayFee', 'netId', 'timestamp', 'updatedAt']

export const typeOfStatusValues: Record<string, string> = {
  height: 'number',
  online: 'boolean',
  fee: 'number',
  fees: 'object',
  relayFee: 'number',
  netId: 'string',
  timestamp: 'number',
  updatedAt: 'string',
}

export const listOfSettingsKeys = ['debug', 'currency', 'network', 'eventBus', 'respondAs', 'authDetails']

export const typeOfSettingsKeys: Record<string, string> = {
  debug: 'number',
  currency: 'string',
  network: 'string',
  eventBus: 'function',
  respondAs: 'string',
  authDetails: 'object',
}

export const valuesForSettings: Record<string, (string | number)[]> = {
  currency: ['btc', 'eth'],
  network: ['testnet', 'regtest', 'main', 'rinkeby'],
  debug: [0, 1, 2, 4],
  respondAs: ['callback', 'direct'],
}

export const authDetailsData: Record<string, string> = {
  key: 'string',
  secret: 'string',
}

interface ValidType {
  [index: string]: { type: string; values?: string[] }
}

export const optionsValidValues: ValidType = {
  skip: { type: 'number' },
  limit: { type: 'number' },
  watch: { type: 'string' },
  respondDirect: { type: 'boolean' },
}

export const optionsRequestValidValues: ValidType = {
  watch: { type: 'string' },
  respondDirect: { type: 'boolean' },
}

export const SEND_DATA_SPEC: DataSpec = {
  amount: { type: 'number', required: true }, // the transfer amount in satoshi
  collect: { type: 'string', required: true }, // collect raw transaction
  deposit: { type: 'string' }, // deposit raw transaction
  depositPath: { type: 'string' }, // deposit hd derived path
  from: { type: 'string' }, // free text to be attached to this transfer
  hint: { type: 'string' }, // passcode hint for the recipient
  owner: { type: 'string', length: { min: 20, max: 120 }, required: true }, // owner id of this transaction, maxLength: 120, minLength: 20
  salt: { type: 'string', required: true }, // salt used to encrypt collect transaction
  to: { type: 'string', required: true }, // the destination address
}
