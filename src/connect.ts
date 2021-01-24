import feathers, { Application, HookContext } from '@feathersjs/feathers';
import { StorageWrapper } from '@feathersjs/authentication-client/lib/storage';
import io from 'socket.io-client';
import crypto from 'crypto-js';
import socket from '@feathersjs/socketio-client';
import { AuthenticationResult } from '@feathersjs/authentication';
import auth, { Storage, MemoryStorage } from '@feathersjs/authentication-client';

import { capitalize, makeString, diff, getTime, Type, LogInfo, LogApiWarning, LogApiError } from './tools';
import { ApiService, AnyValue, Either, AuthDetails, EventBusProps, Maybe } from './types/types';
import { ApiError } from './types/error';
import { apiUrl as apiUrlFromConfig, connectionTriesMax, connectionTimeout } from './config';
import { WARNINGS, ERRORS, MESSAGES } from './text';

let apiUrl = apiUrlFromConfig;

function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);

  const bufView = new Uint8Array(buf);

  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }

  return buf;
}

const generateKey = async () => {
  if (typeof window === 'undefined') {
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
  if (typeof window === 'undefined') {
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
  if (typeof window === 'undefined' || typeof _payloadKey[sessionId] === 'undefined') {
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
    typeof window === 'undefined' ||
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

  const decrypted = String.fromCharCode.apply(null, buffer as AnyValue);

  return JSON.parse(decrypted);
};

class Connect {
  #connect: Application<unknown>;

  #socket: SocketIOClient.Socket;

  #auth: AuthDetails;

  #sessionId = 0;

  #connectionCounter = 0;

  #lastConnect: number | undefined = undefined;

  #manuallyDisconnected = false;

  public isAuthed = false;

  constructor(authDetails: AuthDetails) {
    this.#auth = authDetails;

    this.#sessionId = ++_payloadCount;

    // setup
    this._logTechnical('Service is configuring connection...');

    // choose url to use
    this.#socket = io.connect(apiUrl) as never;

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

    this.#connect = connect.configure(auth({ storageKey: 'auth', storage: new safeStorage() })).hooks({
      finally: {
        all: [
          async (context: HookContext) => {
            // eslint-disable-next-line no-console
            console.log('encr', context.result);

            if (context.result.encrypted) context.result = await decrypt(context.result, this.#sessionId);

            // eslint-disable-next-line no-console
            console.log('ready', context.result);
          },
        ],
      },
    });

    // connect/disconnect event processes
    this._logTechnical('Service is setting up connect/disconnect listeners...');

    try {
      this.#connect.io.on('connect', (): void => {
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
    } catch (err) {
      this._logApiError(ERRORS.connect.on.connect.direct, err);
    }

    try {
      this.#connect.io.on('disconnect', (payload: string) => {
        this._logApiWarning(WARNINGS.connect.disconnect, capitalize(payload));
      });
    } catch (err) {
      this._logApiError(ERRORS.connect.on.disconnect.direct, err);
    }

    this._logTechnical(makeString(MESSAGES.technical.serviceIs, ['setting up event listeners...']));

    // set internet connection check
    if (typeof window === 'undefined') {
      // this is backend
      setInterval(() => {
        this._logTechnical('Checking connection status...');
        require('dns')
          .promises.lookup('google.com')
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
      }, 3000);
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
      .then(async () => {
        this._logTechnical('Service is authed, resetting connectionCounter.');
        this.#connectionCounter = 0;
        this._logTechnical('Setting lastConnect timestamp.');
        this.#lastConnect = getTime();
        await this.#connect.get('authentication');
        this.isAuthed = true;
      })
      .catch(err => {
        this._logTechnical(ERRORS.service.failedAuth);
        this.isAuthed = false;
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
        this.#connect
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
    } catch (err) {
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

  public getService(path: string, eventBus?: Maybe<EventBusProps>): ApiService {
    return this.#connect.service(path).hooks({
      before: {
        all: [
          async (context: HookContext) => {
            if (context.params.query) {
              context.params.query = await encrypt(context.params.query, this.#sessionId);
            }
          },
        ],
      },
      after: {
        all: [
          async (context: HookContext) => {
            if (context.result) {
              context.result = await decrypt(context.result, this.#sessionId);

              if (eventBus?.eventBus && eventBus?.type)
                eventBus.eventBus({ type: eventBus.type, payload: context.result });
            }
          },
        ],
      },
      error: {
        all: [
          async (context: HookContext) => {
            if (context.error) {
              context.error = await decrypt(context.error, this.#sessionId);
            }
          },
        ],
      },
    });
  }

  public issConnected() {
    return this.#connect.io.io.readyState === 'open';
  }

  public connect() {
    this.#socket.connect().open();
  }

  public async decrypt(payload: Record<string, unknown>) {
    if (
      typeof window === 'undefined' ||
      typeof _payloadKey[this.#sessionId] === 'undefined' ||
      typeof payload.encrypted !== 'string'
    ) {
      return payload;
    }

    const ciphertext = await window.crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: _payloadKey[this.#sessionId].iv,
      },
      _payloadKey[this.#sessionId].key,
      str2ab(window.atob(payload.encrypted)),
    );

    const buffer = new Uint8Array(ciphertext);

    const decrypted = String.fromCharCode.apply(null, buffer as AnyValue);

    return JSON.parse(decrypted);
  }
}

export { Connect };
