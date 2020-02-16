"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var validators_1 = require("./validators");
var splitText = function (text) { return text.split(''); };
var reassign = function (group, position, newMember) {
    group.splice(0, 1);
    return __spreadArrays([newMember], group);
};
exports.capitalize = function (text) {
    if (typeof text !== 'string')
        return '';
    return reassign(splitText(text), 0, splitText(text)[0].toUpperCase()).join('');
};
exports.makeStringFromTemplate = function (template, params) {
    if (typeof template !== 'string')
        return '';
    if (!validators_1.validateArray(params, ['string', 'number']))
        return '';
    var result = template;
    params.forEach(function (param, key) {
        result = result.replace("%" + (key + 1), param);
    });
    return result;
};
exports.compareBasicObjects = function (objOne, objTwo) {
    var result = true;
    try {
        // validation
        validators_1.validateObject(objOne);
        validators_1.validateObject(objTwo);
        if (Object.keys(objOne).length !== Object.keys(objTwo).length)
            return false;
        Object.keys(objOne).forEach(function (key) {
            if (objOne[key] !== objTwo[key])
                result = false;
        });
    }
    catch (e) {
        result = false;
    }
    return result;
};
