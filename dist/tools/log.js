"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogInfo = exports.LogApiWarning = exports.LogApiError = exports.Log = exports.LogTypes = void 0;
const _1 = require(".");
var LogTypes;
(function (LogTypes) {
    LogTypes["ERROR"] = "error";
    LogTypes["INFO"] = "info";
    LogTypes["WARNING"] = "warn";
})(LogTypes = exports.LogTypes || (exports.LogTypes = {}));
class Log {
    constructor(type, message, payload) {
        this._log = console;
        this._type = type;
        this._message = message;
        if (payload)
            this._payload = payload;
    }
    make() {
        var _a;
        try {
            if (process.env.NODE_ENV !== 'test')
                this._log[this._type](this._message, (_a = this._payload) !== null && _a !== void 0 ? _a : '');
        }
        catch (err) {
            return;
        }
    }
}
exports.Log = Log;
class LogApiError extends Log {
    constructor(message, error) {
        super(LogTypes.ERROR, message || 'Unknown API Error', _1.makeApiResponseError(error || null /* need this null for obfuscator*/));
    }
}
exports.LogApiError = LogApiError;
class LogApiWarning extends Log {
    constructor(message, payload) {
        super(LogTypes.WARNING, message || 'Unknown Warning', payload);
    }
}
exports.LogApiWarning = LogApiWarning;
class LogInfo extends Log {
    constructor(message, payload) {
        super(LogTypes.INFO, message || '', payload);
    }
}
exports.LogInfo = LogInfo;
//# sourceMappingURL=log.js.map