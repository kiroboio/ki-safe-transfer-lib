import { ConfigProps, Endpoints, Settings } from './types';
declare class Config {
    protected _VERSION: string;
    protected _url: string;
    protected _endpoints: {
        collect: string;
        inbox: string;
        transfers: string;
    };
    private _isDev;
    private _isTest;
    private _debug;
    private _currency;
    private _network;
    private _connect;
    private _getStatus;
    private _logger;
    constructor({ debug, network, currency, logger, getStatus, refreshInbox }: ConfigProps);
    private _debugLevelSelector;
    private _makeEndpointPath;
    getService: (endpoint: Endpoints) => any;
    getSettings: () => Settings;
}
export default Config;
