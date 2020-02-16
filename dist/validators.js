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
    var _a;
    var validate = {
        message: data_1.TEXT.errors.validation.malformedData,
        errors: (_a = {}, _a[data_1.TEXT.errors.validation.missingValues] = [], _a[data_1.TEXT.errors.validation.malformedValues] = [], _a),
    };
    var pushMissing = function (subject) { return validate.errors[data_1.TEXT.errors.validation.missingValues].push(subject); };
    var pushMalformed = function (subject) { return validate.errors[data_1.TEXT.errors.validation.malformedValues].push(subject); };
    // checking for missing required values
    if (!data.to)
        pushMissing('to');
    if (!data.amount)
        pushMissing('amount');
    if (!data.collect)
        pushMissing('collect');
    if (!data.deposit)
        pushMissing('deposit');
    // if all keys present, check for malformed values
    if (!validate.errors[data_1.TEXT.errors.validation.missingValues].length) {
        if (!exports.validateAddress({ address: data.to, currency: currency, networkType: networkType }))
            pushMalformed('to');
        if (typeof data.collect !== 'string')
            pushMalformed('collect');
        if (typeof data.deposit !== 'string')
            pushMalformed('deposit');
        if (typeof data.amount !== 'number')
            pushMalformed('amount');
        if (data.from && typeof data.from !== 'string')
            pushMalformed('from');
        if (data.hint && typeof data.hint !== 'string')
            pushMalformed('hint');
        if (data.id && typeof data.id !== 'string')
            pushMalformed('id');
    }
    else
        delete validate.errors[data_1.TEXT.errors.validation.malformedValues];
    var throwError = function () {
        return validate.errors[data_1.TEXT.errors.validation.missingValues].length > 0 ||
            validate.errors[data_1.TEXT.errors.validation.malformedValues].length > 0;
    };
    // if status false throw error
    if (throwError()) {
        Object.keys(validate.errors).forEach(function (key) {
            if (validate.errors[key].length > 0) {
                validate.message = validate.message + " " + key + validate.errors[key].join(', ') + ".";
            }
        });
        throw new TypeError(validate.message);
    }
};
exports.validateArray = function (arr, type) {
    if (!Array.isArray(arr))
        return false;
    var result = true;
    arr.forEach(function (el) {
        if (!type.includes(typeof el))
            result = false;
    });
    return result;
};
exports.validateObject = function (data) {
    if (data !== Object(data))
        throw new TypeError(data_1.TEXT.errors.validation.typeOfObject);
    if (Array.isArray(data))
        throw new TypeError(data_1.TEXT.errors.validation.noArray);
    if (typeof data === 'function')
        throw new TypeError(data_1.TEXT.errors.validation.noFunction);
};
exports.validateSettings = function (settings) {
    exports.validateObject(settings);
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
