import { ObjectWithStringKeys } from './types'

export const TEXT = {
  errors: {
    validation: {
      emptyObject: "Settings object can't be empty.",
      extraKeys: 'Extra keys present in settings.',
      noArray: "Settings can't be an Array.",
      noFunction: "Settings can't be a function.",
      typeOfObject: 'Wrong type of object for settings',
      unknownKeys: 'Unknown key in settings: ',
      wrongValueType: "Key '%1' in settings has value of wrong type. Should be: %2.",
      wrongValue: "Wrong value '%1' for key '%2' in settings. Should be one of: %3.",
    },
  },
}

export const listOfSettingsKeys = ['debug', 'currency', 'network', 'eventBus', 'respondAs']

export const typeOfSettingsKeys: ObjectWithStringKeys = {
  debug: 'number',
  currency: 'string',
  network: 'string',
  eventBus: 'function',
  respondAs: 'string',
}

export const valuesForSettings: ObjectWithStringKeys = {
  currency: ['btc'],
  network: ['testnet', 'regnet'],
  debug: [0, 1, 2],
  respondAs: ['callback', 'direct'],
}
