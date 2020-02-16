"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var feathers_1 = __importDefault(require("@feathersjs/feathers"));
var socket_io_client_1 = __importDefault(require("socket.io-client"));
var socketio_client_1 = __importDefault(require("@feathersjs/socketio-client"));
var tools_1 = require("./tools");
var types_1 = require("./types");
// TODO: add comments
var Config = /** @class */ (function () {
    function Config(_a) {
        var _this = this;
        var debug = _a.debug, network = _a.network, currency = _a.currency, logger = _a.logger, getStatus = _a.getStatus, refreshInbox = _a.refreshInbox;
        // fixed
        this._VERSION = 'v1';
        this._url = 'https://api.kirobo.me';
        this._endpoints = {
            collect: 'transfer/action/collect',
            inbox: 'transfer/inbox',
            transfers: 'transfers',
        };
        this._isDev = process.env.NODE_ENV === 'development';
        this._isTest = process.env.NODE_ENV === 'test';
        this._debugLevelSelector = function (debug) {
            if (debug)
                return debug;
            if (_this._isTest)
                return types_1.DebugLevels.MUTE;
            if (_this._isDev)
                return types_1.DebugLevels.VERBOSE;
            return types_1.DebugLevels.QUIET;
        };
        this._makeEndpointPath = function (endpoint) {
            var path = "/" + _this._VERSION + "/" + _this._currency + "/";
            if (endpoint === types_1.Endpoints.Networks)
                return path + endpoint;
            return path + (_this._network + "/" + _this._endpoints[endpoint]);
        };
        this.getService = function (endpoint) { return _this._connect.service(_this._makeEndpointPath(endpoint)); };
        this.getSettings = function () { return ({
            debug: _this._debug,
            currency: _this._currency,
            network: _this._network,
            version: _this._VERSION,
        }); };
        this._debug = this._debugLevelSelector(debug);
        this._currency = currency ? currency : types_1.Currencies.Bitcoin;
        this._network = network ? network : types_1.Networks.Testnet;
        this._getStatus = getStatus ? getStatus : function () { };
        this._logger = logger ? logger : function (_a) { };
        // setup
        var socket = socket_io_client_1.default(this._url);
        this._connect = feathers_1.default().configure(socketio_client_1.default(socket));
        // connect/disconnect
        try {
            socket.on('connect', function () {
                _this._logger({
                    type: types_1.Logger.Info,
                    message: 'Service (connect) is ON.',
                });
                _this._getStatus();
                if (refreshInbox)
                    refreshInbox();
            });
        }
        catch (e) {
            this._logger({
                type: types_1.Logger.Error,
                message: "Service (connect) got an error. " + (e.message || ''),
            });
        }
        try {
            socket.on('disconnect', function (payload) {
                return _this._logger({
                    type: types_1.Logger.Warning,
                    message: 'Service (disconnect) is OFF.',
                    payload: tools_1.capitalize(payload),
                });
            });
        }
        catch (e) {
            this._logger({
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
