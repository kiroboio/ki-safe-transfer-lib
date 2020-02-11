import { Collectable, CollectRequest, Message, ResponseCollect, Retrievable, Sendable, ServiceProps, Settings, Status } from './types';
/**
 * Kirobo Safe Transfer library class to provide convenient
 * way to use the service
 * @class
 * @name Service
 */
declare class Service {
    private _settings;
    private _eventBus;
    private _networks;
    private _transfers;
    private _inbox;
    private _collect;
    private _lastAddresses;
    private _isTest;
    constructor(settings?: ServiceProps | any);
    private _validateProps;
    private _responder;
    private _logger;
    private _errLogger;
    private _refreshInbox;
    getLastAddresses: () => string[];
    clearLastAddresses: () => never[];
    getSettings: () => Settings;
    getStatus: () => any;
    getRetrievable: (id: string) => any;
    getCollectables: (addresses: string[]) => Promise<Retrievable | Collectable[] | ResponseCollect | Status | Message | undefined>;
    send: (transaction: Sendable) => Promise<Retrievable | Collectable[] | ResponseCollect | Status | Message | undefined>;
    collect: (request: CollectRequest) => any;
}
export * from './types';
export default Service;
