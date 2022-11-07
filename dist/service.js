"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = exports.Service = void 0;
const connect_1 = require("./connect");
Object.defineProperty(exports, "ApiService", { enumerable: true, get: function () { return connect_1.ApiService; } });
const tools_1 = require("./tools");
const validators_1 = require("./validators");
class Service extends connect_1.Connect {
    constructor(authDetails, url, messageCallback) {
        super(authDetails, url, messageCallback);
    }
    static getInstance() {
        return Service.instance;
    }
    static createInstance(authDetails, url, messageCallback) {
        validators_1.validateAuthDetails(authDetails);
        if (Service.instance)
            this.disconnect();
        Service.instance = new Service(authDetails, url, messageCallback);
        return Service.instance;
    }
    static disconnect() {
        var _a;
        if (Service.instance)
            Service.instance._disconnect();
        (_a = tools_1.Type(Service)) === null || _a === void 0 ? true : delete _a.instance;
    }
}
exports.Service = Service;
//# sourceMappingURL=service.js.map