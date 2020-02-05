"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var verify = function (data) {
    var verify = {
        message: 'Data is malformed.',
        errors: { 'Missing values:': [], 'Malformed values:': [] },
    };
    // TODO: implement verification process
    // checking for missing values
    if (!data.to)
        verify.errors['Missing values:'].push('to');
    if (!data.amount)
        verify.errors['Missing values:'].push('amount');
    if (!data.collect)
        verify.errors['Missing values:'].push('collect');
    if (!data.deposit)
        verify.errors['Missing values:'].push('deposit');
    // checking for malformed values
    if (data.to && !data.to.match(/^[a-z0-9]+$/i))
        verify.errors['Malformed values:'].push('to');
    if (typeof data.collect !== 'string')
        verify.errors['Malformed values:'].push('collect');
    if (typeof data.deposit !== 'string')
        verify.errors['Malformed values:'].push('deposit');
    if (data.from && typeof data.from !== 'string')
        verify.errors['Malformed values:'].push('from');
    if (data.hint && typeof data.hint !== 'string')
        verify.errors['Malformed values:'].push('hint');
    var throwError = function () { return verify.errors['Missing values:'].length > 0 || verify.errors['Malformed values:'].length > 0; };
    // if status false throw error
    if (throwError()) {
        Object.keys(verify.errors).forEach(function (key) {
            if (verify.errors[key].length > 0) {
                verify.message = verify.message + " " + key + " " + verify.errors[key].join(', ') + ".";
            }
        });
        throw new Error(verify.message);
    }
};
exports.default = verify;
