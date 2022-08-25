"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateArray = void 0;
function validateArray(arr, type) {
    if (!Array.isArray(arr))
        return false;
    let result = true;
    arr.forEach(el => {
        if (!type.includes(typeof el))
            result = false;
    });
    return result;
}
exports.validateArray = validateArray;
//# sourceMappingURL=array.js.map