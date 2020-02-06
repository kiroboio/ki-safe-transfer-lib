"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var feathers_1 = __importDefault(require("@feathersjs/feathers"));
var socket_io_client_1 = __importDefault(require("socket.io-client"));
var socketio_client_1 = __importDefault(require("@feathersjs/socketio-client"));
var types_1 = require("./types");
// TODO: add comments
var Config = /** @class */ (function () {
    function Config(_a) {
        var _this = this;
        var debug = _a.debug, network = _a.network, currency = _a.currency, eventBus = _a.eventBus, respond = _a.respond, refreshInbox = _a.refreshInbox;
        // fixed
        this._VERSION = 'v1';
        this._url = 'http://3.92.123.183';
        this._endpoints = {
            collect: 'transfer/action/collect',
            inbox: 'transfer/inbox',
            transfers: 'transfers',
        };
        this._respond = function (type, payload) {
            if (_this._response === types_1.Responses.Direct)
                return payload;
            if (_this._response === types_1.Responses.Callback)
                _this._eventBus({ type: type, payload: payload });
        };
        this._makeEndpointPath = function (endpoint) {
            var path = "/" + _this._VERSION + "/" + _this._currency + "/";
            if (endpoint === types_1.Endpoints.Networks)
                return path + endpoint;
            return path + (_this._network + "/" + _this._endpoints[endpoint]);
        };
        this._log = function (_a) {
            var type = _a.type, payload = _a.payload, message = _a.message;
            // if not MUTE mode
            if (_this._debug !== types_1.DebugLevels.MUTE) {
                // errors are shown in all other modes
                if (!type)
                    console.error(message);
                if (type === 2)
                    payload ? console.warn(message, payload) : console.warn(message);
                // info is shown only in verbose mode
                else if (type === 1 && _this._debug === types_1.DebugLevels.VERBOSE)
                    payload ? console.log(message, payload) : console.log(message);
            }
        };
        this.getService = function (endpoint) { return _this._connect.service(_this._makeEndpointPath(endpoint)); };
        this.getSettings = function () { return ({
            debug: _this._debug,
            currency: _this._currency,
            network: _this._network,
            version: _this._VERSION,
        }); };
        // used on connect/reconnect
        this.getStatus = function () {
            return _this._networks
                .get(_this._network)
                .then(function (response) {
                var payload = { height: response.height, online: response.online };
                _this._log({ type: types_1.Logger.Info, payload: payload, message: 'Service (getStatus): ' });
                return _this._respond(types_1.EventTypes.UPDATE_STATUS, payload);
            })
                .catch(function (e) {
                if (_this._response === types_1.Responses.Direct)
                    throw new Error(e.message);
                _this._log({ type: types_1.Logger.Error, message: "Service (getStatus) got an error: " + (e.message || 'unknown') });
            });
        };
        var isDev = process.env.NODE_ENV === 'development';
        this._debug = debug ? debug : isDev ? types_1.DebugLevels.VERBOSE : types_1.DebugLevels.QUIET;
        this._currency = currency ? currency : types_1.Currencies.Bitcoin;
        this._network = network ? network : types_1.Networks.Testnet;
        this._eventBus = eventBus ? eventBus : function (event) { };
        this._response = respond ? respond : types_1.Responses.Direct;
        // setup
        var socket = socket_io_client_1.default(this._url);
        console.log(refreshInbox);
        this._connect = feathers_1.default().configure(socketio_client_1.default(socket));
        this._networks = this.getService(types_1.Endpoints.Networks);
        // connect/disconnect
        try {
            socket.on('connect', function () {
                _this._log({
                    type: types_1.Logger.Info,
                    message: 'Service (connect) is ON.',
                });
                _this.getStatus();
                if (refreshInbox)
                    refreshInbox();
            });
        }
        catch (e) {
            this._log({
                type: types_1.Logger.Error,
                message: "Service (connect) got an error. " + (e.message || ''),
            });
        }
        try {
            socket.on('disconnect', function (payload) {
                return _this._log({
                    type: types_1.Logger.Warning,
                    message: 'Service (disconnect) is OFF.',
                    payload: payload,
                });
            });
        }
        catch (e) {
            this._log({
                type: types_1.Logger.Error,
                message: "Service (disconnect) got an error. " + (e.message || ''),
            });
        }
        // set internet connection check
        if (typeof window === 'undefined') {
            // this is backend
            setInterval(function () {
                require('dns')
                    .promises.lookup('google.com')
                    .then(function () {
                    if (!socket.connected)
                        socket.connect();
                })
                    .catch(function () {
                    if (socket.connected)
                        socket.disconnect();
                });
            }, 3000);
        }
        else {
            //  this is web
            window.addEventListener('offline', function () {
                if (socket.connected)
                    socket.disconnect();
            });
            window.addEventListener('online', function () {
                if (!socket.connected)
                    socket.connect();
            });
        }
    }
    return Config;
}());
exports.default = Config;
