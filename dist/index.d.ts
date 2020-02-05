import { ServiceProps, Settings, Retrievable, Collectable, Status, Sendable, CollectRequest, ResponseCollect } from './types';
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
    constructor(settings: ServiceProps | {});
    private _respond;
    private _log;
    getSettings: () => Settings;
    getStatus: () => any;
    getRetrievable: (id: string) => any;
    getCollectables: (address: string) => Promise<Retrievable | Collectable[] | ResponseCollect | Status | undefined>;
    send: (transaction: Sendable) => Promise<Retrievable | Collectable[] | ResponseCollect | Status | undefined>;
    collect: (request: CollectRequest) => any;
}
export * from './types';
export default Service;
