"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
var _ApiService_service, _ApiService_sessionId, _Connect_connect, _Connect_socket, _Connect_auth, _Connect_sessionId, _Connect_connectionCounter, _Connect_lastConnect, _Connect_manuallyDisconnected, _Connect_messageCallback, _Connect_services, _Connect_isAuthed;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = exports.Connect = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const feathers_1 = __importDefault(require("@feathersjs/feathers"));
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const socketio_client_1 = __importDefault(require("@feathersjs/socketio-client"));
const authentication_client_1 = __importStar(require("@feathersjs/authentication-client"));
const tools_1 = require("./tools");
const config_1 = require("./config");
const text_1 = require("./text");
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
    get(id, params) {
        var _a;
        if (!__classPrivateFieldGet(this, _ApiService_service, "f")) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new Promise((_resolve, reject) => reject('No Service'));
        }
        return (_a = __classPrivateFieldGet(this, _ApiService_service, "f")) === null || _a === void 0 ? void 0 : _a.get(id, params);
    }
    find(params) {
        if (!__classPrivateFieldGet(this, _ApiService_service, "f")) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new Promise((_resolve, reject) => reject('No Service'));
        }
        return __classPrivateFieldGet(this, _ApiService_service, "f").find(params);
    }
    create(data, params) {
        if (!__classPrivateFieldGet(this, _ApiService_service, "f")) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new Promise((_resolve, reject) => reject('No Service'));
        }
        return __classPrivateFieldGet(this, _ApiService_service, "f").create(data, params);
    }
    update(id, data, params) {
        if (!__classPrivateFieldGet(this, _ApiService_service, "f")) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new Promise((_resolve, reject) => reject('No Service'));
        }
        return __classPrivateFieldGet(this, _ApiService_service, "f").update(id, data, params);
    }
    patch(id, data, params) {
        if (!__classPrivateFieldGet(this, _ApiService_service, "f")) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new Promise((_resolve, reject) => reject('No Service'));
        }
        return __classPrivateFieldGet(this, _ApiService_service, "f").patch(id, data, params);
    }
    remove(id, params) {
        if (!__classPrivateFieldGet(this, _ApiService_service, "f")) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new Promise((_resolve, reject) => reject('No Service'));
        }
        return __classPrivateFieldGet(this, _ApiService_service, "f").remove(id, params);
    }
    on(event, listener) {
        var _a;
        (_a = __classPrivateFieldGet(this, _ApiService_service, "f")) === null || _a === void 0 ? void 0 : _a.on(event, (...args) => __awaiter(this, void 0, void 0, function* () {
            listener(yield decrypt(args[0], __classPrivateFieldGet(this, _ApiService_sessionId, "f")));
        }));
    }
    removeAllListeners(event) {
        var _a;
        (_a = __classPrivateFieldGet(this, _ApiService_service, "f")) === null || _a === void 0 ? void 0 : _a.removeAllListeners(event);
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
    constructor(path, app, services, sessionId) {
        _ApiService_service.set(this, void 0);
        _ApiService_sessionId.set(this, void 0);
        let service = services[path];
        if (!service) {
            service = app.service(path);
            services[path] = service;
            ApiService.setHooks(service, sessionId);
        }
        __classPrivateFieldSet(this, _ApiService_service, service, "f");
        __classPrivateFieldSet(this, _ApiService_sessionId, sessionId, "f");
    }
}
exports.ApiService = ApiService;
_ApiService_service = new WeakMap(), _ApiService_sessionId = new WeakMap();
class Connect {
    constructor(authDetails, url, messageCallback) {
        _Connect_connect.set(this, void 0);
        _Connect_socket.set(this, void 0);
        _Connect_auth.set(this, void 0);
        _Connect_sessionId.set(this, 0);
        _Connect_connectionCounter.set(this, 0);
        _Connect_lastConnect.set(this, undefined);
        _Connect_manuallyDisconnected.set(this, false);
        _Connect_messageCallback.set(this, void 0);
        _Connect_services.set(this, void 0);
        _Connect_isAuthed.set(this, false);
        __classPrivateFieldSet(this, _Connect_auth, authDetails, "f");
        // this.#hostUrl = url;
        __classPrivateFieldSet(this, _Connect_messageCallback, messageCallback, "f");
        __classPrivateFieldSet(this, _Connect_sessionId, ++_payloadCount, "f");
        __classPrivateFieldSet(this, _Connect_services, {}, "f");
        // setup
        this._logTechnical('Service is configuring connection...');
        // choose url to use
        let hosturl = url ? url : apiUrl;
        __classPrivateFieldSet(this, _Connect_socket, socket_io_client_1.default.connect(hosturl), "f");
        __classPrivateFieldGet(this, _Connect_socket, "f").on('encrypt', (publicKey) => {
            if (typeof window !== 'undefined') {
                _authKey = publicKey;
            }
        });
        const connect = (0, feathers_1.default)().configure((0, socketio_client_1.default)(__classPrivateFieldGet(this, _Connect_socket, "f"), {
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
                    return JSON.parse(bytes.toString((0, tools_1.Type)(crypto_js_1.default.enc.Utf8)));
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
        // @ts-expect-error - something wrong with the types
        __classPrivateFieldSet(this, _Connect_connect, connect.configure((0, authentication_client_1.default)({ storageKey: 'auth', storage: new safeStorage() })), "f");
        // connect/disconnect event processes
        this._logTechnical('Service is setting up connect/disconnect listeners...');
        try {
            // @ts-expect-error - something wrong with the types
            __classPrivateFieldGet(this, _Connect_connect, "f").io.on('connect', () => {
                if (__classPrivateFieldGet(this, _Connect_messageCallback, "f"))
                    __classPrivateFieldGet(this, _Connect_messageCallback, "f").call(this, 'connected');
                this._logTechnical((0, tools_1.makeString)(text_1.MESSAGES.technical.proceedingWith, ['is connected', 'authorization']));
                this._logTechnical((0, tools_1.makeString)(text_1.MESSAGES.technical.serviceIs, ["checking if it's allowed to proceed:"]));
                this._logTechnical(`➜ connectionCounter: ${__classPrivateFieldGet(this, _Connect_connectionCounter, "f")}`);
                this._logTechnical(`➜ lastConnect: ${__classPrivateFieldGet(this, _Connect_lastConnect, "f")}`);
                if (__classPrivateFieldGet(this, _Connect_connectionCounter, "f") <= config_1.connectionTriesMax &&
                    (!__classPrivateFieldGet(this, _Connect_lastConnect, "f") || (0, tools_1.diff)(__classPrivateFieldGet(this, _Connect_lastConnect, "f")) > config_1.connectionTimeout)) {
                    this._logTechnical(text_1.MESSAGES.technical.isAllowed);
                    this._runAuth();
                }
                else {
                    this._logTechnical(text_1.MESSAGES.technical.notAllowed);
                    // show tech message, that exceed connection qty
                    if (__classPrivateFieldGet(this, _Connect_connectionCounter, "f") > config_1.connectionTriesMax) {
                        this._exceededQtyLog(config_1.connectionTriesMax);
                        __classPrivateFieldGet(this, _Connect_socket, "f").disconnect().close();
                        __classPrivateFieldSet(this, _Connect_manuallyDisconnected, true, "f");
                    }
                    else {
                        if ((0, tools_1.diff)(__classPrivateFieldGet(this, _Connect_lastConnect, "f")) <= config_1.connectionTimeout) {
                            this._tooEarlyToConnectLog(__classPrivateFieldGet(this, _Connect_lastConnect, "f"), config_1.connectionTimeout);
                            __classPrivateFieldGet(this, _Connect_socket, "f").disconnect().close();
                            __classPrivateFieldSet(this, _Connect_manuallyDisconnected, true, "f");
                            setTimeout(() => {
                                __classPrivateFieldSet(this, _Connect_manuallyDisconnected, false, "f");
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
            // @ts-expect-error - something wrong with the types
            __classPrivateFieldGet(this, _Connect_connect, "f").io.on('disconnect', (payload) => {
                this._logApiWarning(text_1.WARNINGS.connect.disconnect, (0, tools_1.capitalize)(payload));
                if (__classPrivateFieldGet(this, _Connect_messageCallback, "f"))
                    __classPrivateFieldGet(this, _Connect_messageCallback, "f").call(this, 'disconnected');
            });
        }
        catch (err) {
            this._logApiError(text_1.ERRORS.connect.on.disconnect.direct, err);
        }
        this._logTechnical((0, tools_1.makeString)(text_1.MESSAGES.technical.serviceIs, ['setting up event listeners...']));
        // set internet connection check
        if (typeof window === 'undefined') {
            // this is backend
            setInterval(() => {
                this._logTechnical('Checking connection status...');
                fetch('https://google.com', {
                    method: 'FET',
                    cache: 'no-cache',
                    headers: { 'Content-Type': 'application/json' },
                    referrerPolicy: 'no-referrer',
                })
                    .then(() => {
                    // @ts-expect-error - something wrong with the types
                    if (!__classPrivateFieldGet(this, _Connect_connect, "f").io.connected && __classPrivateFieldGet(this, _Connect_connectionCounter, "f") <= config_1.connectionTriesMax) {
                        this._logTechnical('Connection is online, but service is not');
                        if (__classPrivateFieldGet(this, _Connect_manuallyDisconnected, "f"))
                            this._logTechnical(text_1.MESSAGES.technical.connection.wontReconnect);
                        else {
                            this._logTechnical('Reconnecting');
                            // @ts-expect-error - something wrong with the types
                            __classPrivateFieldGet(this, _Connect_connect, "f").io.connect();
                        }
                    }
                    if (__classPrivateFieldGet(this, _Connect_connectionCounter, "f") > config_1.connectionTriesMax)
                        this._logApiWarning((0, tools_1.makeString)(text_1.MESSAGES.technical.connection.exceeded, [__classPrivateFieldGet(this, _Connect_connectionCounter, "f"), config_1.connectionTriesMax]));
                })
                    .catch(() => {
                    // @ts-expect-error - something wrong with the types
                    if (__classPrivateFieldGet(this, _Connect_connect, "f").io.connected) {
                        this._logTechnical(text_1.MESSAGES.technical.connection.willConnect);
                        // @ts-expect-error - something wrong with the types
                        __classPrivateFieldGet(this, _Connect_connect, "f").io.disconnect();
                    }
                });
            }, 3000);
        }
        else {
            window.addEventListener('online', () => {
                // @ts-expect-error - something wrong with the types
                if (!__classPrivateFieldGet(this, _Connect_connect, "f").io.connected && __classPrivateFieldGet(this, _Connect_connectionCounter, "f") <= config_1.connectionTriesMax) {
                    this._logTechnical(text_1.MESSAGES.technical.connection.willReConnect);
                    // @ts-expect-error - something wrong with the types
                    __classPrivateFieldGet(this, _Connect_connect, "f").io.connect();
                }
                // @ts-expect-error - something wrong with the types
                if (!__classPrivateFieldGet(this, _Connect_connect, "f").io.connected && __classPrivateFieldGet(this, _Connect_connectionCounter, "f") > config_1.connectionTriesMax)
                    this._logApiWarning(text_1.MESSAGES.technical.connection.willNotReconnect);
            });
        }
    }
    _runAuth() {
        this._logTechnical((0, tools_1.makeString)(text_1.MESSAGES.technical.running, ['runAuth']));
        (0, tools_1.Type)(this._authSocket())
            .then(( /* payload: AuthenticationResult */) => __awaiter(this, void 0, void 0, function* () {
            this._logTechnical('Service is authed, resetting connectionCounter.');
            __classPrivateFieldSet(this, _Connect_connectionCounter, 0, "f");
            this._logTechnical('Setting lastConnect timestamp.');
            __classPrivateFieldSet(this, _Connect_lastConnect, (0, tools_1.getTime)(), "f");
            const payload = yield __classPrivateFieldGet(this, _Connect_connect, "f").get('authentication');
            __classPrivateFieldSet(this, _Connect_isAuthed, true, "f");
            if (__classPrivateFieldGet(this, _Connect_messageCallback, "f"))
                __classPrivateFieldGet(this, _Connect_messageCallback, "f").call(this, 'authorized', payload ? yield decrypt(payload, __classPrivateFieldGet(this, _Connect_sessionId, "f")) : payload);
        }))
            .catch(err => {
            var _a;
            this._logTechnical(text_1.ERRORS.service.failedAuth);
            __classPrivateFieldSet(this, _Connect_isAuthed, false, "f");
            __classPrivateFieldSet(this, _Connect_connectionCounter, (_a = __classPrivateFieldGet(this, _Connect_connectionCounter, "f"), _a++, _a), "f");
            this._logTechnical('Setting lastConnect timestamp.');
            __classPrivateFieldSet(this, _Connect_lastConnect, (0, tools_1.getTime)(), "f");
            this._logApiError(text_1.ERRORS.connect.on.connect.authSocket, err);
        });
    }
    _authSocket() {
        this._logTechnical((0, tools_1.makeString)(text_1.MESSAGES.technical.running, ['authSocket']));
        try {
            this._logTechnical('Service (authSocket) is trying to re-authenticate...');
            // @ts-expect-error - something wrong with the types
            return __classPrivateFieldGet(this, _Connect_connect, "f").reAuthenticate().catch(() => __awaiter(this, void 0, void 0, function* () {
                this._logTechnical((0, tools_1.makeString)(text_1.ERRORS.service.failedTo, ['authSocket', 're-authenticate', 'authentication']));
                return (__classPrivateFieldGet(this, _Connect_connect, "f")
                    // @ts-expect-error - something wrong with the types
                    .authenticate(Object.assign({ strategy: 'local' }, (yield authEncrypt(Object.assign({}, __classPrivateFieldGet(this, _Connect_auth, "f")), __classPrivateFieldGet(this, _Connect_sessionId, "f")))))
                    // @ts-expect-error - something wrong with the types
                    .catch(err => {
                    // if not
                    this._logApiError(text_1.ERRORS.connect.authenticate, err);
                    this._logTechnical('Set connectionCounter to MAX+1.');
                    __classPrivateFieldSet(this, _Connect_connectionCounter, config_1.connectionTriesMax + 1, "f");
                    this._logTechnical('Set lastConnect timestamp.');
                    __classPrivateFieldSet(this, _Connect_lastConnect, (0, tools_1.getTime)(), "f");
                }));
            }));
        }
        catch (err) {
            this._logApiError(text_1.ERRORS.connect.reAuthenticate, err);
            this._logTechnical('Set connectionCounter to MAX+1.');
            __classPrivateFieldSet(this, _Connect_connectionCounter, config_1.connectionTriesMax + 1, "f");
            this._logTechnical('Set lastConnect timestamp.');
            __classPrivateFieldSet(this, _Connect_lastConnect, (0, tools_1.getTime)(), "f");
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
        // @ts-expect-error - something wrong with the types
        if (__classPrivateFieldGet(this, _Connect_connect, "f"))
            __classPrivateFieldGet(this, _Connect_connect, "f").io.destroy();
    }
    getService(path) {
        return new ApiService(path, __classPrivateFieldGet(this, _Connect_connect, "f"), __classPrivateFieldGet(this, _Connect_services, "f"), __classPrivateFieldGet(this, _Connect_sessionId, "f"));
    }
    isConnected() {
        // @ts-expect-error - something wrong with the types
        return __classPrivateFieldGet(this, _Connect_connect, "f").io.io.readyState === 'open';
    }
    connect() {
        __classPrivateFieldGet(this, _Connect_socket, "f").connect().open();
    }
    setMessageCallback(fn) {
        __classPrivateFieldSet(this, _Connect_messageCallback, fn, "f");
    }
    isAuthorized() {
        return __classPrivateFieldGet(this, _Connect_isAuthed, "f");
    }
}
exports.Connect = Connect;
_Connect_connect = new WeakMap(), _Connect_socket = new WeakMap(), _Connect_auth = new WeakMap(), _Connect_sessionId = new WeakMap(), _Connect_connectionCounter = new WeakMap(), _Connect_lastConnect = new WeakMap(), _Connect_manuallyDisconnected = new WeakMap(), _Connect_messageCallback = new WeakMap(), _Connect_services = new WeakMap(), _Connect_isAuthed = new WeakMap();
//# sourceMappingURL=connect.js.map