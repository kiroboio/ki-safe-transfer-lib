"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObject = void 0;
const ramda_1 = require("ramda");
const text_1 = require("../text");
const tools_1 = require("../tools");
function validateObject(data, argName) {
    if ((0, ramda_1.isNil)(data))
        throw new TypeError(text_1.ERRORS.validation.missingArgument);
    if (data !== Object(data))
        throw new TypeError(text_1.ERRORS.validation.typeOfObject);
    if (Array.isArray(data))
        throw new TypeError((0, tools_1.makeString)(text_1.MESSAGES.validation.cantBe, [argName ? (0, tools_1.capitalize)(argName) : 'Argument', 'array', 'object {}']));
    if (typeof data === 'function')
        throw new TypeError(text_1.ERRORS.validation.noFunction);
}
exports.validateObject = validateObject;
//# sourceMappingURL=object.js.map