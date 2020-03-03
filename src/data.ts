/* eslint-disable prettier/prettier */
import { ObjectWithStringKeys, ObjectWithStringKeysAnyValues } from './types'

export const TEXT = {
  errors: {
    validation: {
      missingArgument: 'Data is missing',
      emptyObject: 'Settings object can\'t be empty.',
      extraKeys: 'Extra keys present in settings.',
      noArray: 'Argument can\'t be an Array.',
      noFunction: 'Argument can\'t be a function.',
      typeOfObject: 'Wrong type of argument',
      unknownKeys: 'Unknown key in settings: ',
      wrongValueType: 'Key \'%1\' in settings has value of wrong type. Should be: %2.',
      wrongValue: 'Wrong value \'%1\' for key \'%2\' in settings. Should be one of: %3.',
      malformedData: 'Data is malformed.',
      malformedAddress: 'Malformed address: %1.',
      missingValues: 'Missing values: ',
      malformedValues: 'Malformed values: ',
    },
  },
}

export const listOfStatusKeys: ObjectWithStringKeysAnyValues = ['height', 'online', 'fee']

export const typeOfStatusValues: ObjectWithStringKeysAnyValues = { height: 'number', online: 'boolean', fee: 'number' }

export const listOfSettingsKeys = ['debug', 'currency', 'network', 'eventBus', 'respondAs', 'authDetails']

export const typeOfSettingsKeys: ObjectWithStringKeys = {
  debug: 'number',
  currency: 'string',
  network: 'string',
  eventBus: 'function',
  respondAs: 'string',
  authDetails: 'object',
}

export const valuesForSettings: ObjectWithStringKeys = {
  currency: ['btc'],
  network: ['testnet', 'regnet'],
  debug: [0, 1, 2],
  respondAs: ['callback', 'direct'],
}

export const authDetailsData: ObjectWithStringKeys = {
  key: 'string',
  secret: 'string',
}

export const validBitcoinAddresses = [
  '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
  '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
  '2N83Bu4MbzxDscNCtx5qFQHpV5VhpgghzVn',
  'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
]
