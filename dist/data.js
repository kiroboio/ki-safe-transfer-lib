"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEXT = {
    errors: {
        validation: {
            missingArgument: 'Data is missing',
            emptyObject: "Settings object can't be empty.",
            extraKeys: 'Extra keys present in settings.',
            noArray: "Argument can't be an Array.",
            noFunction: "Argument can't be a function.",
            typeOfObject: 'Wrong type of argument',
            unknownKeys: 'Unknown key in settings: ',
            wrongValueType: "Key '%1' in settings has value of wrong type. Should be: %2.",
            wrongValue: "Wrong value '%1' for key '%2' in settings. Should be one of: %3.",
            malformedData: 'Data is malformed.',
            missingValues: 'Missing values: ',
            malformedValues: 'Malformed values: ',
        },
    },
};
exports.listOfSettingsKeys = ['debug', 'currency', 'network', 'eventBus', 'respondAs'];
exports.typeOfSettingsKeys = {
    debug: 'number',
    currency: 'string',
    network: 'string',
    eventBus: 'function',
    respondAs: 'string',
};
exports.valuesForSettings = {
    currency: ['btc'],
    network: ['testnet', 'regnet'],
    debug: [0, 1, 2],
    respondAs: ['callback', 'direct'],
};
exports.validBitcoinAddresses = [
    '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
    '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
    'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
];
