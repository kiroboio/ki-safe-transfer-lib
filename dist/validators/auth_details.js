"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuthDetails = void 0;
const data_1 = require("../data");
const _1 = require(".");
const text_1 = require("../text");
function validateAuthDetails(details) {
    if (!details)
        throw new TypeError(`${text_1.ERRORS.validation.missingArgument}: authDetails.`);
    _1.validateObject(details);
    const objKeys = Object.keys(details);
    if (objKeys.length !== 2) {
        throw new TypeError(`${text_1.ERRORS.validation.malformedData} [authDetails] has less or extra keys.`);
    }
    Object.keys(data_1.authDetailsData).forEach(key => {
        if (!objKeys.includes(key))
            throw new TypeError(`${text_1.ERRORS.validation.missingValues}${key} (authdetails).`);
    });
    objKeys.forEach(key => {
        const value = details[key];
        if (!data_1.authDetailsData[key]) {
            throw new TypeError(`${text_1.ERRORS.validation.unknownKeys}${key} (authdetails).`);
        }
        if (!value) {
            throw new TypeError(`${text_1.ERRORS.validation.missingValues}${key} (authdetails).`);
        }
        if (typeof value !== data_1.authDetailsData[key]) {
            throw new TypeError(`${text_1.ERRORS.validation.typeOfObject}: ${key} can't be of type ${typeof value}, if should be of ${data_1.authDetailsData[key]} type (authdetails).`);
        }
    });
}
exports.validateAuthDetails = validateAuthDetails;
//# sourceMappingURL=auth_details.js.map