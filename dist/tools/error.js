"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeApiResponseError = void 0;
const ramda_1 = require("ramda");
const _1 = require(".");
function makeApiResponseError(error) {
    /** set default error object */
    let response = { name: 'BadRequest', code: 400, message: 'Unknown API request error' };
    /** if no error provided or it is empty -> return default  */
    if ((0, ramda_1.isNil)(error) || (0, ramda_1.isEmpty)(error))
        return response;
    /** function to check if new data should be assign to the default object */
    function shouldAssign(data, key) {
        /** not if missing */
        if ((0, ramda_1.isNil)(data))
            return false;
        /** not if empty */
        if ((0, ramda_1.isEmpty)(data))
            return false;
        /** not if the same */
        if (data === (0, _1.Type)(response)[key])
            return false;
        return true;
    }
    /** assigner function */
    const assignerFn = (data) => (key) => {
        // @ts-expect-error - something wrong with the types
        if (shouldAssign(data[key], key))
            response = (0, ramda_1.assoc)(key, data[key], response);
    };
    /** run for each of default fields */
    (0, ramda_1.forEach)(assignerFn((0, _1.Type)(error)), ['name', 'message', 'code', 'data', 'errors']);
    /** try to parse message, in case it has some object inside */
    try {
        const convert = JSON.parse(response.message);
        (0, ramda_1.forEach)(assignerFn(convert), Object.keys(convert));
    }
    catch (err) {
        // No need to do anything
    }
    return response;
}
exports.makeApiResponseError = makeApiResponseError;
//# sourceMappingURL=error.js.map