"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = __importDefault(require("./config"));
var types_1 = require("./types");
var validators_1 = require("./validators");
// TODO: add comments
/**
 * Kirobo Safe Transfer library class to provide convenient
 * way to use the service
 * @class
 * @name Service
 */
var Service = /** @class */ (function () {
    function Service(settings) {
        var _this = this;
        this._lastAddresses = []; // caching last addresses request
        // responder
        this._respond = function (type, payload) {
            if (_this._settings.respond === types_1.Responses.Direct)
                return payload;
            if (_this._settings.respond === types_1.Responses.Callback)
                _this._eventBus({ type: type, payload: payload });
        };
        // logger
        this._log = function (_a) {
            var type = _a.type, payload = _a.payload, message = _a.message;
            // if not MUTE mode
            if (_this._settings.debug !== types_1.DebugLevels.MUTE) {
                // errors are shown in all other modes
                if (!type)
                    console.error(message);
                // info is shown only in verbose mode
                else if (type && _this._settings.debug === types_1.DebugLevels.VERBOSE)
                    console.log(message, payload);
            }
        };
        this._refreshInbox = function () {
            if (_this._lastAddresses.length)
                return _this._inbox
                    .find({ query: { to: _this._lastAddresses.join(';') } })
                    .then(function (payload) {
                    console.log(payload);
                    _this._eventBus({ type: types_1.EventTypes.GET_COLLECTABLES, payload: payload.data });
                })
                    .catch(function (e) {
                    _this._log({
                        type: types_1.Logger.Error,
                        message: "Service (getCollectables) got an error: " + (e.message || 'unknown'),
                    });
                });
        };
        this.clearLastAddresses = function () { return (_this._lastAddresses = []); };
        // show settings
        this.getSettings = function () { return _this._settings; };
        // get current API status (height and online)
        this.getStatus = function () {
            return _this._networks
                .get(_this._settings.network)
                .then(function (response) {
                var payload = { height: response.height, online: response.online };
                _this._log({ type: types_1.Logger.Info, payload: payload, message: 'Service (getStatus): ' });
                return _this._respond(types_1.EventTypes.UPDATE_STATUS, payload);
            })
                .catch(function (e) {
                if (_this._settings.respond === types_1.Responses.Direct)
                    throw new Error(e.message);
                _this._log({ type: types_1.Logger.Error, message: "Service (getStatus) got an error: " + (e.message || 'unknown') });
            });
        };
        // get retrievable by ID
        this.getRetrievable = function (id) {
            return _this._transfers
                .get(id)
                .then(function (payload) {
                _this._log({ type: types_1.Logger.Info, payload: payload, message: 'Service (getRetrievable): ' });
                return _this._respond(types_1.EventTypes.GET_RETRIEVABLE, payload);
            })
                .catch(function (e) {
                if (_this._settings.respond === types_1.Responses.Direct)
                    throw new Error(e.message);
                _this._log({ type: types_1.Logger.Error, message: "Service (getRetrievable) got an error. " + e.message });
            });
        };
        // get all collectables by recipient address
        this.getCollectables = function (addresses) { return __awaiter(_this, void 0, void 0, function () {
            var payload, e_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!Array.isArray(addresses))
                            throw new Error('Malformed request. Not an array.');
                        addresses.forEach(function (address) {
                            if (!validators_1.validateAddress({ address: address, currency: _this._settings.currency, networkType: _this._settings.network }))
                                throw new Error("Malformed address: " + address);
                        });
                        return [4 /*yield*/, this._inbox.find({ query: { to: addresses.join(';') } })];
                    case 1:
                        payload = _a.sent();
                        this._lastAddresses = addresses;
                        this._log({ type: types_1.Logger.Info, payload: payload.data, message: 'Service (getCollectables): ' });
                        return [2 /*return*/, this._respond(types_1.EventTypes.GET_COLLECTABLES, payload.data)];
                    case 2:
                        e_1 = _a.sent();
                        if (this._settings.respond === types_1.Responses.Direct)
                            throw new Error(e_1.message);
                        this._log({ type: types_1.Logger.Error, message: "Service (getCollectables) got an error: " + e_1.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // send retrievable/collectable transaction
        this.send = function (transaction) { return __awaiter(_this, void 0, void 0, function () {
            var payload, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        validators_1.validateData(transaction, this._settings.currency, this._settings.network);
                        return [4 /*yield*/, this._transfers.create(transaction)];
                    case 1:
                        payload = _a.sent();
                        return [2 /*return*/, this._respond(types_1.EventTypes.SEND_TRANSACTION, payload)];
                    case 2:
                        e_2 = _a.sent();
                        if (this._settings.respond === types_1.Responses.Direct)
                            throw new Error(e_2.message);
                        this._log({ type: types_1.Logger.Error, message: "Service (send) got an error. " + e_2.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        // collect transaction
        this.collect = function (request) {
            return _this._collect
                .create(__assign({}, request))
                .then(function (payload) {
                _this._log({ type: types_1.Logger.Info, payload: payload, message: 'Service (collect): ' });
                return _this._respond(types_1.EventTypes.SEND_TRANSACTION, {
                    text: 'Request submitted.',
                    isError: false,
                    data: payload,
                });
            })
                .catch(function (e) {
                if (_this._settings.respond === types_1.Responses.Direct)
                    throw new Error(e.message);
                _this._log({ type: types_1.Logger.Error, message: "Service (collect) got an error. " + e.message });
                var isWrongPasscode = e.message === 'Transaction Rejected by the Blockchain';
                return _this._respond(types_1.EventTypes.SEND_MESSAGE, {
                    text: isWrongPasscode ? 'Wrong passcode.' : 'Request or network error.',
                    isError: true,
                });
            });
        };
        var _a = settings, debug = _a.debug, currency = _a.currency, network = _a.network, respond = _a.respond, eventBus = _a.eventBus;
        this._eventBus = eventBus ? eventBus : function (event) { };
        var config = new config_1.default({ debug: debug, currency: currency, network: network, eventBus: eventBus, respond: respond, refreshInbox: this._refreshInbox });
        // store settings
        this._settings = __assign(__assign({}, config.getSettings()), { respond: respond || types_1.Responses.Direct });
        // set services
        this._networks = config.getService(types_1.Endpoints.Networks);
        this._transfers = config.getService(types_1.Endpoints.Transfers);
        this._inbox = config.getService(types_1.Endpoints.Inbox);
        this._collect = config.getService(types_1.Endpoints.Collect);
        // event listeners
        // status update
        this._networks.on('patched', function (data) {
            var height = data.height, online = data.online;
            _this._eventBus({
                type: types_1.EventTypes.UPDATE_STATUS,
                payload: { height: height, online: online },
            });
        });
        // retrievable updated
        this._transfers.on('patched', function (payload) {
            _this._eventBus({
                type: types_1.EventTypes.UPDATED_RETRIEVABLE,
                payload: payload,
            });
        });
        // new collectable has been created for the previously requested address
        this._inbox.on('created', function (payload) {
            _this._eventBus({
                type: types_1.EventTypes.CREATED_COLLECTABLE,
                payload: payload,
            });
        });
        // collectable updated
        this._inbox.on('updated', function (payload) {
            _this._eventBus({
                type: types_1.EventTypes.UPDATED_COLLECTABLE,
                payload: payload,
            });
        });
        // collectable removed
        this._inbox.on('removed', function (payload) {
            _this._eventBus({
                type: types_1.EventTypes.REMOVED_COLLECTABLE,
                payload: payload,
            });
        });
    }
    return Service;
}());
__export(require("./types"));
exports.default = Service;
