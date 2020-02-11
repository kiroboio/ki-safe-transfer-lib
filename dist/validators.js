"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var multicoin_address_validator_1 = __importDefault(require("multicoin-address-validator"));
var data_1 = require("./data");
var tools_1 = require("./tools");
var isString = function (data) { return typeof data === 'string'; };
exports.validateAddress = function (_a) {
    var address = _a.address, currency = _a.currency, networkType = _a.networkType;
    return isString(address) ? multicoin_address_validator_1.default.validate(address, currency, networkType) : false;
};
exports.validateData = function (data, currency, networkType) {
    var validate = {
        message: 'Data is malformed.',
        errors: { 'Missing values:': [], 'Malformed values:': [] },
    };
    var pushMissing = function (subject) { return validate.errors['Missing values:'].push(subject); };
    var pushMalformed = function (subject) { return validate.errors['Malformed values:'].push(subject); };
    // checking for missing values
    if (!data.to)
        pushMissing('to');
    if (!data.amount)
        pushMissing('amount');
    if (!data.collect)
        pushMissing('collect');
    if (!data.deposit)
        pushMissing('deposit');
    // checking for malformed values
    // if (data.to && !data.to.match(/^[a-z0-9]+$/i)) validate.errors['Malformed values:'].push('to')
    if (!exports.validateAddress({ address: data.to, currency: currency, networkType: networkType }))
        pushMalformed('to');
    if (typeof data.collect !== 'string')
        pushMalformed('collect');
    if (typeof data.deposit !== 'string')
        pushMalformed('deposit');
    if (data.from && typeof data.from !== 'string')
        pushMalformed('from');
    if (data.hint && typeof data.hint !== 'string')
        pushMalformed('hint');
    var throwError = function () {
        return validate.errors['Missing values:'].length > 0 || validate.errors['Malformed values:'].length > 0;
    };
    // if status false throw error
    if (throwError()) {
        Object.keys(validate.errors).forEach(function (key) {
            if (validate.errors[key].length > 0) {
                validate.message = validate.message + " " + key + " " + validate.errors[key].join(', ') + ".";
            }
        });
        throw new Error(validate.message);
    }
};
exports.validateSettings = function (settings) {
    if (settings !== Object(settings))
        throw new TypeError(data_1.TEXT.errors.validation.typeOfObject);
    if (Array.isArray(settings))
        throw new TypeError(data_1.TEXT.errors.validation.noArray);
    if (typeof settings === 'function')
        throw new TypeError(data_1.TEXT.errors.validation.noFunction);
    var setObj = settings;
    var objKeys = Object.keys(setObj);
    if (objKeys.length === 0)
        throw new TypeError(data_1.TEXT.errors.validation.emptyObject);
    if (objKeys.length > data_1.listOfSettingsKeys.length)
        throw new TypeError(data_1.TEXT.errors.validation.extraKeys);
    objKeys.forEach(function (key) {
        if (!data_1.listOfSettingsKeys.includes(key))
            throw new TypeError("" + data_1.TEXT.errors.validation.unknownKeys + key + ".");
        var type = data_1.typeOfSettingsKeys[key];
        var value = setObj[key];
        if (typeof value !== type)
            throw new TypeError(tools_1.makeStringFromTemplate(data_1.TEXT.errors.validation.wrongValueType, [key, type]));
        var values = data_1.valuesForSettings[key];
        // @ts-ignore - some issue, where .includes requires 'never'
        if (values && !values.includes(value))
            throw new TypeError(tools_1.makeStringFromTemplate(data_1.TEXT.errors.validation.wrongValue, [value, key, values.join(', ')]));
    });
};
