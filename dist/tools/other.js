"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = exports.makeString = exports.capitalize = void 0;
const validators_1 = require("../validators");
const splitText = (text) => text.split('');
const reassign = (group, newMember) => {
    group.splice(0, 1);
    return [newMember, ...group];
};
const capitalize = (text) => {
    if (typeof text !== 'string')
        return '';
    return reassign(splitText(text), splitText(text)[0].toUpperCase()).join('');
};
exports.capitalize = capitalize;
const makeString = (template, params) => {
    if (typeof template !== 'string')
        return '';
    if (!validators_1.validateArray(params, ['string', 'number']))
        return '';
    let result = template;
    params.forEach((param, key) => {
        result = result.replace(`%${key + 1}`, String(param));
    });
    return result;
};
exports.makeString = makeString;
const Type = (object) => object;
exports.Type = Type;
//# sourceMappingURL=other.js.map