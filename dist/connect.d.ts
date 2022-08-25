import feathers, { Application, Service as FeathersService } from '@feathersjs/feathers';
import { AnyValue, AuthDetails, MessageCallback } from './types/types';
import { ApiError } from './types/error';
declare type FeathersEventType = 'created' | 'updated' | 'removed' | 'patched';
declare class ApiService {
    #private;
    get(id: string | number, params?: feathers.Params | undefined): Promise<unknown>;
    find(params?: feathers.Params | undefined): Promise<unknown>;
    create(data: Partial<unknown>, params?: feathers.Params): Promise<unknown>;
    update(id: feathers.Id, data: Partial<unknown>, params?: feathers.Params): Promise<unknown>;
    patch(id: feathers.Id, data: Partial<unknown>, params?: feathers.Params): Promise<unknown>;
    remove(id: feathers.Id, params?: feathers.Params | undefined): Promise<unknown>;
    on(event: FeathersEventType, listener: (arg2: AnyValue) => AnyValue): void;
    removeAllListeners(event: FeathersEventType): void;
    static setHooks(service: FeathersService<unknown>, sessionId: number): void;
    constructor(path: string, app: Application<unknown>, services: {
        [key: string]: FeathersService<unknown>;
    }, sessionId: number);
}
declare class Connect {
    #private;
    constructor(authDetails: AuthDetails, url?: string, messageCallback?: MessageCallback);
    private _runAuth;
    private _authSocket;
    private _logTechnical;
    protected _logApiError(message: string, error?: ApiError | undefined): void;
    protected _logApiWarning(message: string, payload?: unknown | undefined): void;
    protected _exceededQtyLog(time: number): void;
    protected _tooEarlyToConnectLog(last: number | undefined, timeout: number): void;
    protected _disconnect(): void;
    getService(path: string): ApiService;
    isConnected(): boolean;
    connect(): void;
    setMessageCallback(fn: MessageCallback): void;
    isAuthorized(): boolean;
}
export { Connect, ApiService };
