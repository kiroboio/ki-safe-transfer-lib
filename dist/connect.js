"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
var _service, _sessionId, _conn, _connect, _socket, _auth, _sessionId_1, _connectionCounter, _lastConnect, _manuallyDisconnected, _messageCallback, _services, _isAuthed;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = exports.Connect = void 0;
const authentication_client_1 = __importStar(require("@feathersjs/authentication-client"));
const feathers_1 = __importDefault(require("@feathersjs/feathers"));
const socketio_client_1 = __importDefault(require("@feathersjs/socketio-client"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const is_online_1 = __importDefault(require("is-online"));
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const config_1 = require("./config");
const text_1 = require("./text");
const tools_1 = require("./tools");
let apiUrl = config_1.apiUrl;
function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
const isWithoutBrowserCrypto = typeof window === 'undefined' || ((_a = window === null || window === void 0 ? void 0 : window.navigator) === null || _a === void 0 ? void 0 : _a.userAgent) === 'ReactNative';
const generateKey = () => __awaiter(void 0, void 0, void 0, function* () {
    if (isWithoutBrowserCrypto) {
        return undefined;
    }
    const key = yield window.crypto.subtle.generateKey({
        name: 'AES-CBC',
        length: 128,
    }, true, ['encrypt', 'decrypt']);
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    return { key, iv };
});
const chunkSubstr = (str, size) => {
    const numChunks = Math.ceil(str.length / size);
    const chunks = new Array(numChunks);
    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
        chunks[i] = str.substr(o, size);
    }
    return chunks;
};
let _authKey = undefined;
const _payloadKey = [];
let _payloadCount = 0;
const authEncrypt = (payload, sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    if (isWithoutBrowserCrypto) {
        return payload;
    }
    const data = Object.assign({}, payload);
    _payloadKey[sessionId] = (yield generateKey());
    if (_payloadKey[sessionId]) {
        const keyData = yield window.crypto.subtle.exportKey('raw', _payloadKey[sessionId].key);
        data.encrypt = {
            key: Buffer.from(keyData).toString('base64'),
            iv: Buffer.from(_payloadKey[sessionId].iv).toString('base64'),
        };
    }
    const binaryDer = str2ab(window.atob(window.atob(_authKey || '')));
    const publicKey = yield window.crypto.subtle.importKey('spki', binaryDer, {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
    }, true, ['encrypt']);
    const chunks = chunkSubstr(JSON.stringify(data), 60);
    const encrypted = [];
    for (const chunk of chunks) {
        const enc = new TextEncoder();
        const encoded = enc.encode(chunk);
        const ciphertext = yield window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, encoded);
        const buffer = ciphertext ? new Uint8Array(ciphertext) : new Uint8Array();
        encrypted.push(btoa(String.fromCharCode.apply(null, buffer)));
    }
    return { encrypted };
});
const encrypt = (payload, sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    if (isWithoutBrowserCrypto || typeof _payloadKey[sessionId] === 'undefined') {
        return payload;
    }
    const enc = new TextEncoder();
    const encoded = enc.encode(JSON.stringify(payload));
    const ciphertext = yield window.crypto.subtle.encrypt({
        name: 'AES-CBC',
        iv: _payloadKey[sessionId].iv,
    }, _payloadKey[sessionId].key, encoded);
    const buffer = new Uint8Array(ciphertext);
    const encrypted = btoa(String.fromCharCode.apply(null, buffer));
    return { encrypted };
});
const decrypt = (payload, sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    if (isWithoutBrowserCrypto ||
        typeof _payloadKey[sessionId] === 'undefined' ||
        typeof payload.encrypted !== 'string') {
        return payload;
    }
    const ciphertext = yield window.crypto.subtle.decrypt({
        name: 'AES-CBC',
        iv: _payloadKey[sessionId].iv,
    }, _payloadKey[sessionId].key, str2ab(window.atob(payload.encrypted)));
    const buffer = new Uint8Array(ciphertext);
    const decrypted = new TextDecoder().decode(buffer);
    return JSON.parse(decrypted);
});
class ApiService {
    constructor({ path, app, services, sessionId, conn, }) {
        _service.set(this, void 0);
        _sessionId.set(this, void 0);
        _conn.set(this, void 0);
        this.ensureConnect = (func) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const checkInterval = 1000; // check every 2 seconds
                const maxChecks = 30; // maximum number of checks to perform
                let checkCount = 0; // counter for number of checks performed
                const interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    // perform check
                    // console.log(eff.status);
                    if (__classPrivateFieldGet(this, _conn).isAuthorized()) {
                        clearInterval(interval);
                        resolve(yield func());
                    }
                    checkCount++;
                    // stop checking if maximum number of checks has been reached
                    if (checkCount >= maxChecks) {
                        clearInterval(interval);
                        reject('timeout');
                    }
                }), checkInterval);
            });
        });
        let service = services[path];
        if (!service) {
            service = app.service(path);
            services[path] = service;
            ApiService.setHooks(service, sessionId);
        }
        __classPrivateFieldSet(this, _service, service);
        __classPrivateFieldSet(this, _sessionId, sessionId);
        __classPrivateFieldSet(this, _conn, conn);
    }
    get(id, params) {
        if (!__classPrivateFieldGet(this, _service)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new Promise((_resolve, reject) => reject('No Service'));
        }
        return this.ensureConnect(() => {
            var _a;
            return (_a = __classPrivateFieldGet(this, _service)) === null || _a === void 0 ? void 0 : _a.get(id, params);
        });
    }
    find(params) {
        if (!__classPrivateFieldGet(this, _service)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new Promise((_resolve, reject) => reject('No Service'));
        }
        return this.ensureConnect(() => {
            var _a;
            return (_a = __classPrivateFieldGet(this, _service)) === null || _a === void 0 ? void 0 : _a.find(params);
        });
    }
    create(data, params) {
        if (!__classPrivateFieldGet(this, _service)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new Promise((_resolve, reject) => reject('No Service'));
        }
        return this.ensureConnect(() => {
            var _a;
            return (_a = __classPrivateFieldGet(this, _service)) === null || _a === void 0 ? void 0 : _a.create(data, params);
        });
    }
    update(id, data, params) {
        if (!__classPrivateFieldGet(this, _service)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new Promise((_resolve, reject) => reject('No Service'));
        }
        return this.ensureConnect(() => {
            var _a;
            return (_a = __classPrivateFieldGet(this, _service)) === null || _a === void 0 ? void 0 : _a.update(id, data, params);
        });
    }
    patch(id, data, params) {
        if (!__classPrivateFieldGet(this, _service)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new Promise((_resolve, reject) => reject('No Service'));
        }
        return this.ensureConnect(() => {
            var _a;
            return (_a = __classPrivateFieldGet(this, _service)) === null || _a === void 0 ? void 0 : _a.patch(id, data, params);
        });
    }
    remove(id, params) {
        if (!__classPrivateFieldGet(this, _service)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new Promise((_resolve, reject) => reject('No Service'));
        }
        return this.ensureConnect(() => {
            var _a;
            return (_a = __classPrivateFieldGet(this, _service)) === null || _a === void 0 ? void 0 : _a.remove(id, params);
        });
    }
    on(event, listener) {
        var _a;
        (_a = __classPrivateFieldGet(this, _service)) === null || _a === void 0 ? void 0 : _a.on(event, (...args) => __awaiter(this, void 0, void 0, function* () {
            listener(yield decrypt(args[0], __classPrivateFieldGet(this, _sessionId)));
        }));
    }
    removeAllListeners(event) {
        var _a;
        (_a = __classPrivateFieldGet(this, _service)) === null || _a === void 0 ? void 0 : _a.removeAllListeners(event);
    }
    static setHooks(service, sessionId) {
        service.hooks({
            before: {
                all: [
                    (context) => __awaiter(this, void 0, void 0, function* () {
                        if (context.params.query) {
                            context.params.query = yield encrypt(context.params.query, sessionId);
                        }
                    }),
                ],
            },
            after: {
                all: [
                    (context) => __awaiter(this, void 0, void 0, function* () {
                        if (context.result) {
                            context.result = yield decrypt(context.result, sessionId);
                        }
                    }),
                ],
            },
            error: {
                all: [
                    (context) => __awaiter(this, void 0, void 0, function* () {
                        if (context.error) {
                            context.error = yield decrypt(context.error, sessionId);
                        }
                    }),
                ],
            },
            finally: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                all: [(_context) => __awaiter(this, void 0, void 0, function* () { })],
            },
        });
    }
}
exports.ApiService = ApiService;
_service = new WeakMap(), _sessionId = new WeakMap(), _conn = new WeakMap();
class Connect {
    constructor(authDetails, url, messageCallback) {
        _connect.set(this, void 0);
        // #internet: boolean;
        _socket.set(this, void 0);
        _auth.set(this, void 0);
        _sessionId_1.set(this, 0);
        _connectionCounter.set(this, 0);
        _lastConnect.set(this, undefined);
        _manuallyDisconnected.set(this, false);
        _messageCallback.set(this, void 0);
        _services.set(this, void 0);
        _isAuthed.set(this, false);
        __classPrivateFieldSet(this, _auth, authDetails);
        // this.#hostUrl = url;
        __classPrivateFieldSet(this, _messageCallback, messageCallback);
        __classPrivateFieldSet(this, _sessionId_1, ++_payloadCount);
        __classPrivateFieldSet(this, _services, {});
        // setup
        this._logTechnical('Service is configuring connection...');
        // choose url to use
        let hosturl = url ? url : apiUrl;
        __classPrivateFieldSet(this, _socket, socket_io_client_1.default.connect(hosturl));
        __classPrivateFieldGet(this, _socket).on('encrypt', (publicKey) => {
            if (typeof window !== 'undefined') {
                _authKey = publicKey;
            }
        });
        const connect = feathers_1.default().configure(socketio_client_1.default(__classPrivateFieldGet(this, _socket), {
            timeout: 20000,
        }));
        class safeStorage {
            constructor(key = Math.random().toString(36).substring(7) + Math.random().toString(36).substring(7)) {
                this.storage = new authentication_client_1.MemoryStorage();
                this.key = key;
            }
            getItem(key) {
                return __awaiter(this, void 0, void 0, function* () {
                    const cipherText = yield this.storage.getItem(key);
                    const bytes = crypto_js_1.default.AES.encrypt(cipherText, this.key);
                    return JSON.parse(bytes.toString(tools_1.Type(crypto_js_1.default.enc.Utf8)));
                });
            }
            setItem(key, value) {
                return __awaiter(this, void 0, void 0, function* () {
                    const cipherText = crypto_js_1.default.AES.encrypt(JSON.stringify(value), this.key);
                    return yield this.storage.setItem(key, cipherText.toString());
                });
            }
            removeItem(key) {
                return __awaiter(this, void 0, void 0, function* () {
                    return yield this.storage.removeItem(key);
                });
            }
        }
        // const setInternet = (key: boolean) => {
        //   this.#internet = key;
        // };
        // // When the internet is off
        // window.addEventListener('offline', () => setInternet(false));
        // // When the internet is on
        // window.addEventListener('online', () => setInternet(true));
        __classPrivateFieldSet(this, _connect, connect.configure(authentication_client_1.default({ storageKey: 'auth', storage: new safeStorage() })));
        // connect/disconnect event processes
        this._logTechnical('Service is setting up connect/disconnect listeners...');
        try {
            __classPrivateFieldGet(this, _connect).io.on('connect', () => {
                if (__classPrivateFieldGet(this, _messageCallback))
                    __classPrivateFieldGet(this, _messageCallback).call(this, 'connected');
                this._logTechnical(tools_1.makeString(text_1.MESSAGES.technical.proceedingWith, ['is connected', 'authorization']));
                this._logTechnical(tools_1.makeString(text_1.MESSAGES.technical.serviceIs, ["checking if it's allowed to proceed:"]));
                this._logTechnical(`➜ connectionCounter: ${__classPrivateFieldGet(this, _connectionCounter)}`);
                this._logTechnical(`➜ lastConnect: ${__classPrivateFieldGet(this, _lastConnect)}`);
                if (__classPrivateFieldGet(this, _connectionCounter) <= config_1.connectionTriesMax &&
                    (!__classPrivateFieldGet(this, _lastConnect) || tools_1.diff(__classPrivateFieldGet(this, _lastConnect)) > config_1.connectionTimeout)) {
                    this._logTechnical(text_1.MESSAGES.technical.isAllowed);
                    this._runAuth();
                }
                else {
                    this._logTechnical(text_1.MESSAGES.technical.notAllowed);
                    // show tech message, that exceed connection qty
                    if (__classPrivateFieldGet(this, _connectionCounter) > config_1.connectionTriesMax) {
                        this._exceededQtyLog(config_1.connectionTriesMax);
                        __classPrivateFieldGet(this, _socket).disconnect().close();
                        __classPrivateFieldSet(this, _manuallyDisconnected, true);
                    }
                    else {
                        if (tools_1.diff(__classPrivateFieldGet(this, _lastConnect)) <= config_1.connectionTimeout) {
                            this._tooEarlyToConnectLog(__classPrivateFieldGet(this, _lastConnect), config_1.connectionTimeout);
                            __classPrivateFieldGet(this, _socket).disconnect().close();
                            __classPrivateFieldSet(this, _manuallyDisconnected, true);
                            setTimeout(() => {
                                __classPrivateFieldSet(this, _manuallyDisconnected, false);
                                this._runAuth();
                            }, config_1.connectionTimeout * 1000);
                        }
                    }
                }
            });
        }
        catch (err) {
            this._logApiError(text_1.ERRORS.connect.on.connect.direct, err);
        }
        try {
            __classPrivateFieldGet(this, _connect).io.on('disconnect', (payload) => {
                this._logApiWarning(text_1.WARNINGS.connect.disconnect, tools_1.capitalize(payload));
                if (__classPrivateFieldGet(this, _messageCallback))
                    __classPrivateFieldGet(this, _messageCallback).call(this, 'disconnected');
            });
        }
        catch (err) {
            this._logApiError(text_1.ERRORS.connect.on.disconnect.direct, err);
        }
        this._logTechnical(tools_1.makeString(text_1.MESSAGES.technical.serviceIs, ['setting up event listeners...']));
        // set internet connection check
        if (typeof window === 'undefined') {
            // this is backend
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                this._logTechnical('Checking connection status...');
                yield is_online_1.default()
                    .then(() => {
                    if (!__classPrivateFieldGet(this, _connect).io.connected && __classPrivateFieldGet(this, _connectionCounter) <= config_1.connectionTriesMax) {
                        this._logTechnical('Connection is online, but service is not');
                        if (__classPrivateFieldGet(this, _manuallyDisconnected))
                            this._logTechnical(text_1.MESSAGES.technical.connection.wontReconnect);
                        else {
                            this._logTechnical('Reconnecting');
                            __classPrivateFieldGet(this, _connect).io.connect();
                        }
                    }
                    if (__classPrivateFieldGet(this, _connectionCounter) > config_1.connectionTriesMax)
                        this._logApiWarning(tools_1.makeString(text_1.MESSAGES.technical.connection.exceeded, [__classPrivateFieldGet(this, _connectionCounter), config_1.connectionTriesMax]));
                })
                    .catch(() => {
                    if (__classPrivateFieldGet(this, _connect).io.connected) {
                        this._logTechnical(text_1.MESSAGES.technical.connection.willConnect);
                        __classPrivateFieldGet(this, _connect).io.disconnect();
                    }
                });
            }), 7000);
        }
        else {
            window.addEventListener('online', () => {
                if (!__classPrivateFieldGet(this, _connect).io.connected && __classPrivateFieldGet(this, _connectionCounter) <= config_1.connectionTriesMax) {
                    this._logTechnical(text_1.MESSAGES.technical.connection.willReConnect);
                    __classPrivateFieldGet(this, _connect).io.connect();
                }
                if (!__classPrivateFieldGet(this, _connect).io.connected && __classPrivateFieldGet(this, _connectionCounter) > config_1.connectionTriesMax)
                    this._logApiWarning(text_1.MESSAGES.technical.connection.willNotReconnect);
            });
        }
    }
    _runAuth() {
        this._logTechnical(tools_1.makeString(text_1.MESSAGES.technical.running, ['runAuth']));
        tools_1.Type(this._authSocket())
            .then(( /* payload: AuthenticationResult */) => __awaiter(this, void 0, void 0, function* () {
            this._logTechnical('Service is authed, resetting connectionCounter.');
            __classPrivateFieldSet(this, _connectionCounter, 0);
            this._logTechnical('Setting lastConnect timestamp.');
            __classPrivateFieldSet(this, _lastConnect, tools_1.getTime());
            const payload = yield __classPrivateFieldGet(this, _connect).get('authentication');
            __classPrivateFieldSet(this, _isAuthed, true);
            if (__classPrivateFieldGet(this, _messageCallback))
                __classPrivateFieldGet(this, _messageCallback).call(this, 'authorized', payload ? yield decrypt(payload, __classPrivateFieldGet(this, _sessionId_1)) : payload);
        }))
            .catch(err => {
            this._logTechnical(text_1.ERRORS.service.failedAuth);
            __classPrivateFieldSet(this, _isAuthed, false);
            __classPrivateFieldSet(this, _connectionCounter, +__classPrivateFieldGet(this, _connectionCounter) + 1);
            this._logTechnical('Setting lastConnect timestamp.');
            __classPrivateFieldSet(this, _lastConnect, tools_1.getTime());
            this._logApiError(text_1.ERRORS.connect.on.connect.authSocket, err);
        });
    }
    _authSocket() {
        this._logTechnical(tools_1.makeString(text_1.MESSAGES.technical.running, ['authSocket']));
        try {
            this._logTechnical('Service (authSocket) is trying to re-authenticate...');
            return __classPrivateFieldGet(this, _connect).reAuthenticate().catch(() => __awaiter(this, void 0, void 0, function* () {
                this._logTechnical(tools_1.makeString(text_1.ERRORS.service.failedTo, ['authSocket', 're-authenticate', 'authentication']));
                return __classPrivateFieldGet(this, _connect).authenticate(Object.assign({ strategy: 'local' }, (yield authEncrypt(Object.assign({}, __classPrivateFieldGet(this, _auth)), __classPrivateFieldGet(this, _sessionId_1)))))
                    .catch(err => {
                    // if not
                    this._logApiError(text_1.ERRORS.connect.authenticate, err);
                    this._logTechnical('Set connectionCounter to MAX+1.');
                    __classPrivateFieldSet(this, _connectionCounter, config_1.connectionTriesMax + 1);
                    this._logTechnical('Set lastConnect timestamp.');
                    __classPrivateFieldSet(this, _lastConnect, tools_1.getTime());
                });
            }));
        }
        catch (err) {
            this._logApiError(text_1.ERRORS.connect.reAuthenticate, err);
            this._logTechnical('Set connectionCounter to MAX+1.');
            __classPrivateFieldSet(this, _connectionCounter, config_1.connectionTriesMax + 1);
            this._logTechnical('Set lastConnect timestamp.');
            __classPrivateFieldSet(this, _lastConnect, tools_1.getTime());
            return;
        }
    }
    _logTechnical(message, payload) {
        if (process.env.NODE_ENV === 'development')
            new tools_1.LogInfo(`⌾ ${message}`, payload).make();
    }
    _logApiError(message, error) {
        if (process.env.NODE_ENV === 'development')
            new tools_1.LogApiError(message, error).make();
    }
    _logApiWarning(message, payload) {
        if (process.env.NODE_ENV === 'development')
            new tools_1.LogApiWarning(message, payload).make();
    }
    _exceededQtyLog(time) {
        this._logTechnical(`Service (connect) exceeded MAX connection tries (${time}) and will halt the reconnection efforts.`);
    }
    _tooEarlyToConnectLog(last, timeout) {
        this._logTechnical(`Service (connect) recently (${last}) tried to connect. Will wait for ${timeout}s and try again.`);
    }
    _disconnect() {
        if (__classPrivateFieldGet(this, _connect))
            __classPrivateFieldGet(this, _connect).io.destroy();
    }
    getService(path) {
        return new ApiService({
            path,
            app: __classPrivateFieldGet(this, _connect),
            services: __classPrivateFieldGet(this, _services),
            sessionId: __classPrivateFieldGet(this, _sessionId_1),
            conn: this,
        });
    }
    isConnected() {
        return __classPrivateFieldGet(this, _connect).io.io.readyState === 'open';
    }
    connect() {
        __classPrivateFieldGet(this, _socket).connect().open();
    }
    setMessageCallback(fn) {
        __classPrivateFieldSet(this, _messageCallback, fn);
    }
    isAuthorized() {
        return __classPrivateFieldGet(this, _isAuthed);
    }
}
exports.Connect = Connect;
_connect = new WeakMap(), _socket = new WeakMap(), _auth = new WeakMap(), _sessionId_1 = new WeakMap(), _connectionCounter = new WeakMap(), _lastConnect = new WeakMap(), _manuallyDisconnected = new WeakMap(), _messageCallback = new WeakMap(), _services = new WeakMap(), _isAuthed = new WeakMap();
//# sourceMappingURL=connect.js.map