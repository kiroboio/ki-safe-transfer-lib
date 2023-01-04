/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthenticationResult } from '@feathersjs/authentication';
import auth, { MemoryStorage, Storage } from '@feathersjs/authentication-client';
import { StorageWrapper } from '@feathersjs/authentication-client/lib/storage';
import feathers, { Application, Service as FeathersService, HookContext } from '@feathersjs/feathers';
import socket from '@feathersjs/socketio-client';
import crypto from 'crypto-js';
import * as isOnline from 'is-online';

import io from 'socket.io-client';
import { apiUrl as apiUrlFromConfig, connectionTimeout, connectionTriesMax } from './config';
import { ERRORS, MESSAGES, WARNINGS } from './text';
import { LogApiError, LogApiWarning, LogInfo, Type, capitalize, diff, getTime, makeString } from './tools';
import { ApiError } from './types/error';
import { AnyValue, AuthDetails, Either, Maybe, MessageCallback } from './types/types';

let apiUrl = apiUrlFromConfig;

function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);

  const bufView = new Uint8Array(buf);

  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }

  return buf;
}

const isWithoutBrowserCrypto = typeof window === 'undefined' || window?.navigator?.userAgent === 'ReactNative';

const generateKey = async () => {
  if (isWithoutBrowserCrypto) {
    return undefined;
  }

  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-CBC',
      length: 128,
    },
    true,
    ['encrypt', 'decrypt'],
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(16));

  return { key, iv };
};

const chunkSubstr = (str: string, size: number) => {
  const numChunks = Math.ceil(str.length / size);

  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
};

let _authKey: string | undefined = undefined;

const _payloadKey: { key: CryptoKey; iv: ArrayBuffer }[] = [];

let _payloadCount = 0;

const authEncrypt = async (payload: Record<string, unknown>, sessionId: number) => {
  if (isWithoutBrowserCrypto) {
    return payload;
  }

  const data = { ...payload };

  _payloadKey[sessionId] = (await generateKey()) as { key: CryptoKey; iv: ArrayBuffer };

  if (_payloadKey[sessionId]) {
    const keyData = await window.crypto.subtle.exportKey('raw', _payloadKey[sessionId].key);

    data.encrypt = {
      key: Buffer.from(keyData).toString('base64'),
      iv: Buffer.from(_payloadKey[sessionId].iv).toString('base64'),
    };
  }

  const binaryDer = str2ab(window.atob(window.atob(_authKey || '')));

  const publicKey = await window.crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt'],
  );

  const chunks = chunkSubstr(JSON.stringify(data), 60);

  const encrypted: string[] = [];

  for (const chunk of chunks) {
    const enc = new TextEncoder();

    const encoded = enc.encode(chunk);

    const ciphertext = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, encoded);

    const buffer = ciphertext ? new Uint8Array(ciphertext) : new Uint8Array();

    encrypted.push(btoa(String.fromCharCode.apply(null, buffer as AnyValue)));
  }

  return { encrypted };
};

const encrypt = async (payload: Record<string, unknown>, sessionId: number) => {
  if (isWithoutBrowserCrypto || typeof _payloadKey[sessionId] === 'undefined') {
    return payload;
  }

  const enc = new TextEncoder();

  const encoded = enc.encode(JSON.stringify(payload));

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: _payloadKey[sessionId].iv,
    },
    _payloadKey[sessionId].key,
    encoded,
  );

  const buffer = new Uint8Array(ciphertext);

  const encrypted = btoa(String.fromCharCode.apply(null, buffer as AnyValue));

  return { encrypted };
};

const decrypt = async (payload: Record<string, unknown>, sessionId: number) => {
  if (
    isWithoutBrowserCrypto ||
    typeof _payloadKey[sessionId] === 'undefined' ||
    typeof payload.encrypted !== 'string'
  ) {
    return payload;
  }

  const ciphertext = await window.crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv: _payloadKey[sessionId].iv,
    },
    _payloadKey[sessionId].key,
    str2ab(window.atob(payload.encrypted)),
  );

  const buffer = new Uint8Array(ciphertext);

  const decrypted = new TextDecoder().decode(buffer);

  return JSON.parse(decrypted);
};

type FeathersEventType = 'created' | 'updated' | 'removed' | 'patched';

class ApiService {
  #service: FeathersService<unknown> | undefined;

  #sessionId: number;

  #conn: Connect;

  private ensureConnect = async (func: () => any) => {
    return new Promise((resolve, reject) => {
      const checkInterval = 1000; // check every 2 seconds

      const maxChecks = 30; // maximum number of checks to perform

      let checkCount = 0; // counter for number of checks performed

      const interval = setInterval(async () => {
        // perform check
        // console.log(eff.status);

        if (this.#conn.isAuthorized()) {
          clearInterval(interval);
          resolve(await func());
        }

        checkCount++;

        // stop checking if maximum number of checks has been reached
        if (checkCount >= maxChecks) {
          clearInterval(interval);
          reject('timeout');
        }
      }, checkInterval);
    });
  };

  public get(id: string | number, params?: feathers.Params | undefined): Promise<unknown> {
    if (!this.#service) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return new Promise((_resolve, reject) => reject('No Service'));
    }

    return this.ensureConnect(() => {
      return this.#service?.get(id, params);
    });
  }

  public find(params?: feathers.Params | undefined): Promise<unknown> {
    if (!this.#service) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return new Promise((_resolve, reject) => reject('No Service'));
    }

    return this.ensureConnect(() => {
      return this.#service?.find(params);
    });
  }

  public create(data: Partial<unknown>, params?: feathers.Params): Promise<unknown> {
    if (!this.#service) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return new Promise((_resolve, reject) => reject('No Service'));
    }

    return this.ensureConnect(() => {
      return this.#service?.create(data, params);
    });
  }

  public update(id: feathers.Id, data: Partial<unknown>, params?: feathers.Params): Promise<unknown> {
    if (!this.#service) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return new Promise((_resolve, reject) => reject('No Service'));
    }

    return this.ensureConnect(() => {
      return this.#service?.update(id, data, params);
    });
  }

  public patch(id: feathers.Id, data: Partial<unknown>, params?: feathers.Params): Promise<unknown> {
    if (!this.#service) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return new Promise((_resolve, reject) => reject('No Service'));
    }

    return this.ensureConnect(() => {
      return this.#service?.patch(id, data, params);
    });
  }

  public remove(id: feathers.Id, params?: feathers.Params | undefined): Promise<unknown> {
    if (!this.#service) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return new Promise((_resolve, reject) => reject('No Service'));
    }

    return this.ensureConnect(() => {
      return this.#service?.remove(id, params);
    });
  }

  public on(event: FeathersEventType, listener: (arg2: AnyValue) => AnyValue) {
    this.#service?.on(event, async (...args: AnyValue[]) => {
      listener(await decrypt(args[0], this.#sessionId));
    });
  }

  public removeAllListeners(event: FeathersEventType) {
    this.#service?.removeAllListeners(event);
  }

  static setHooks(service: FeathersService<unknown>, sessionId: number) {
    service.hooks({
      before: {
        all: [
          async (context: HookContext) => {
            if (context.params.query) {
              context.params.query = await encrypt(context.params.query, sessionId);
            }
          },
        ],
      },
      after: {
        all: [
          async (context: HookContext) => {
            if (context.result) {
              context.result = await decrypt(context.result, sessionId);
            }
          },
        ],
      },
      error: {
        all: [
          async (context: HookContext) => {
            if (context.error) {
              context.error = await decrypt(context.error, sessionId);
            }
          },
        ],
      },
      finally: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        all: [async (_context: HookContext) => {}],
      },
    });
  }

  constructor({
    path,
    app,
    services,
    sessionId,
    conn,
  }: {
    path: string;
    app: Application<unknown>;
    services: { [key: string]: FeathersService<unknown> };
    sessionId: number;
    conn: Connect;
  }) {
    let service = services[path];

    if (!service) {
      service = app.service(path);
      services[path] = service;
      ApiService.setHooks(service, sessionId);
    }

    this.#service = service;
    this.#sessionId = sessionId;
    this.#conn = conn;
  }
}

class Connect {
  #connect: Application<unknown>;

  // #internet: boolean;

  #socket: SocketIOClient.Socket;

  #auth: AuthDetails;

  #sessionId = 0;

  #connectionCounter = 0;

  #lastConnect: Either<number, undefined> = undefined;

  #manuallyDisconnected = false;

  #messageCallback: Maybe<MessageCallback>;

  #services: { [key: string]: FeathersService<AnyValue> };

  #isAuthed = false;

  constructor(authDetails: AuthDetails, url?: string, messageCallback?: MessageCallback) {
    this.#auth = authDetails;
    // this.#hostUrl = url;
    this.#messageCallback = messageCallback;
    this.#sessionId = ++_payloadCount;
    this.#services = {};

    // setup
    this._logTechnical('Service is configuring connection...');

    // choose url to use
    let hosturl = url ? url : apiUrl;
    this.#socket = io.connect(hosturl) as never;

    this.#socket.on('encrypt', (publicKey: string) => {
      if (typeof window !== 'undefined') {
        _authKey = publicKey;
      }
    });

    const connect = feathers().configure(
      socket(this.#socket, {
        timeout: 20000,
      }),
    );

    class safeStorage implements Storage {
      private storage: MemoryStorage | StorageWrapper;

      private key: string;

      constructor(key = Math.random().toString(36).substring(7) + Math.random().toString(36).substring(7)) {
        this.storage = new MemoryStorage();
        this.key = key;
      }

      async getItem(key: string) {
        const cipherText = await this.storage.getItem(key);

        const bytes = crypto.AES.encrypt(cipherText, this.key);

        return JSON.parse(bytes.toString(Type(crypto.enc.Utf8)));
      }

      async setItem(key: string, value: AnyValue) {
        const cipherText = crypto.AES.encrypt(JSON.stringify(value), this.key);

        return await this.storage.setItem(key, cipherText.toString());
      }

      async removeItem(key: string) {
        return await this.storage.removeItem(key);
      }
    }

    // const setInternet = (key: boolean) => {
    //   this.#internet = key;
    // };

    // // When the internet is off
    // window.addEventListener('offline', () => setInternet(false));
    // // When the internet is on
    // window.addEventListener('online', () => setInternet(true));

    this.#connect = connect.configure(auth({ storageKey: 'auth', storage: new safeStorage() }));

    // connect/disconnect event processes
    this._logTechnical('Service is setting up connect/disconnect listeners...');

    try {
      this.#connect.io.on('connect', (): void => {
        if (this.#messageCallback) this.#messageCallback('connected');

        this._logTechnical(makeString(MESSAGES.technical.proceedingWith, ['is connected', 'authorization']));

        this._logTechnical(makeString(MESSAGES.technical.serviceIs, ["checking if it's allowed to proceed:"]));

        this._logTechnical(`➜ connectionCounter: ${this.#connectionCounter}`);
        this._logTechnical(`➜ lastConnect: ${this.#lastConnect}`);

        if (
          this.#connectionCounter <= connectionTriesMax &&
          (!this.#lastConnect || diff(this.#lastConnect) > connectionTimeout)
        ) {
          this._logTechnical(MESSAGES.technical.isAllowed);

          this._runAuth();
        } else {
          this._logTechnical(MESSAGES.technical.notAllowed);

          // show tech message, that exceed connection qty
          if (this.#connectionCounter > connectionTriesMax) {
            this._exceededQtyLog(connectionTriesMax);
            this.#socket.disconnect().close();
            this.#manuallyDisconnected = true;
          } else {
            if (diff(this.#lastConnect) <= connectionTimeout) {
              this._tooEarlyToConnectLog(this.#lastConnect, connectionTimeout);
              this.#socket.disconnect().close();
              this.#manuallyDisconnected = true;
              setTimeout(() => {
                this.#manuallyDisconnected = false;

                this._runAuth();
              }, connectionTimeout * 1000);
            }
          }
        }
      });
    } catch (err: any) {
      this._logApiError(ERRORS.connect.on.connect.direct, err);
    }

    try {
      this.#connect.io.on('disconnect', (payload: string) => {
        this._logApiWarning(WARNINGS.connect.disconnect, capitalize(payload));

        if (this.#messageCallback) this.#messageCallback('disconnected');
      });
    } catch (err: any) {
      this._logApiError(ERRORS.connect.on.disconnect.direct, err);
    }

    this._logTechnical(makeString(MESSAGES.technical.serviceIs, ['setting up event listeners...']));

    // set internet connection check
    if (typeof window === 'undefined') {
      // this is backend
      setInterval(() => {
        this._logTechnical('Checking connection status...');
        isOnline()
          .then(() => {
            if (!this.#connect.io.connected && this.#connectionCounter <= connectionTriesMax) {
              this._logTechnical('Connection is online, but service is not');

              if (this.#manuallyDisconnected) this._logTechnical(MESSAGES.technical.connection.wontReconnect);
              else {
                this._logTechnical('Reconnecting');
                this.#connect.io.connect();
              }
            }

            if (this.#connectionCounter > connectionTriesMax)
              this._logApiWarning(
                makeString(MESSAGES.technical.connection.exceeded, [this.#connectionCounter, connectionTriesMax]),
              );
          })
          .catch(() => {
            if (this.#connect.io.connected) {
              this._logTechnical(MESSAGES.technical.connection.willConnect);
              this.#connect.io.disconnect();
            }
          });
      }, 7000);
    } else {
      window.addEventListener('online', () => {
        if (!this.#connect.io.connected && this.#connectionCounter <= connectionTriesMax) {
          this._logTechnical(MESSAGES.technical.connection.willReConnect);
          this.#connect.io.connect();
        }

        if (!this.#connect.io.connected && this.#connectionCounter > connectionTriesMax)
          this._logApiWarning(MESSAGES.technical.connection.willNotReconnect);
      });
    }
  }

  private _runAuth(): void {
    this._logTechnical(makeString(MESSAGES.technical.running, ['runAuth']));
    Type<Promise<AuthDetails>>(this._authSocket())
      .then(async (/* payload: AuthenticationResult */) => {
        this._logTechnical('Service is authed, resetting connectionCounter.');
        this.#connectionCounter = 0;
        this._logTechnical('Setting lastConnect timestamp.');
        this.#lastConnect = getTime();

        const payload = await this.#connect.get('authentication');

        this.#isAuthed = true;

        if (this.#messageCallback)
          this.#messageCallback('authorized', payload ? await decrypt(payload, this.#sessionId) : payload);
      })
      .catch(err => {
        this._logTechnical(ERRORS.service.failedAuth);
        this.#isAuthed = false;
        this.#connectionCounter++;
        this._logTechnical('Setting lastConnect timestamp.');
        this.#lastConnect = getTime();
        this._logApiError(ERRORS.connect.on.connect.authSocket, err);
      });
  }

  private _authSocket(): Either<Promise<Either<AuthenticationResult, void>>, undefined> {
    this._logTechnical(makeString(MESSAGES.technical.running, ['authSocket']));

    try {
      this._logTechnical('Service (authSocket) is trying to re-authenticate...');

      return this.#connect.reAuthenticate().catch(async () => {
        this._logTechnical(makeString(ERRORS.service.failedTo, ['authSocket', 're-authenticate', 'authentication']));
        return this.#connect
          .authenticate({
            strategy: 'local',
            ...(await authEncrypt({ ...this.#auth }, this.#sessionId)),
          })
          .catch(err => {
            // if not
            this._logApiError(ERRORS.connect.authenticate, err);
            this._logTechnical('Set connectionCounter to MAX+1.');
            this.#connectionCounter = connectionTriesMax + 1;
            this._logTechnical('Set lastConnect timestamp.');
            this.#lastConnect = getTime();
          });
      });
    } catch (err: any) {
      this._logApiError(ERRORS.connect.reAuthenticate, err);
      this._logTechnical('Set connectionCounter to MAX+1.');
      this.#connectionCounter = connectionTriesMax + 1;
      this._logTechnical('Set lastConnect timestamp.');
      this.#lastConnect = getTime();
      return;
    }
  }

  private _logTechnical(message: string, payload?: unknown | undefined): void {
    if (process.env.NODE_ENV === 'development') new LogInfo(`⌾ ${message}`, payload).make();
  }

  protected _logApiError(message: string, error?: ApiError | undefined): void {
    if (process.env.NODE_ENV === 'development') new LogApiError(message, error).make();
  }

  protected _logApiWarning(message: string, payload?: unknown | undefined): void {
    if (process.env.NODE_ENV === 'development') new LogApiWarning(message, payload).make();
  }

  protected _exceededQtyLog(time: number): void {
    this._logTechnical(
      `Service (connect) exceeded MAX connection tries (${time}) and will halt the reconnection efforts.`,
    );
  }

  protected _tooEarlyToConnectLog(last: number | undefined, timeout: number): void {
    this._logTechnical(
      `Service (connect) recently (${last}) tried to connect. Will wait for ${timeout}s and try again.`,
    );
  }

  protected _disconnect(): void {
    if (this.#connect) this.#connect.io.destroy();
  }

  public getService(path: string): ApiService {
    return new ApiService({
      path,
      app: this.#connect,
      services: this.#services,
      sessionId: this.#sessionId,
      conn: this,
    });
  }

  public isConnected() {
    return this.#connect.io.io.readyState === 'open';
  }

  public connect() {
    this.#socket.connect().open();
  }

  public setMessageCallback(fn: MessageCallback) {
    this.#messageCallback = fn;
  }

  public isAuthorized() {
    return this.#isAuthed;
  }
}

export { Connect, ApiService };
