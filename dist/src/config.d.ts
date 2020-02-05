import { ConfigProps } from '.';
import { Settings, Endpoints } from './types';
declare class Config {
    protected _VERSION: string;
    protected _url: string;
    protected _endpoints: {
        collect: string;
        inbox: string;
        transfers: string;
    };
    private _debug;
    private _currency;
    private _network;
    private _connect;
    private _response;
    private _eventBus;
    private _networks;
    constructor({ debug, network, currency, eventBus, respond }: ConfigProps);
    private _respond;
    private _makeEndpointPath;
    private _log;
    getService: (endpoint: Endpoints) => any;
    getSettings: () => Settings;
    getStatus: () => any;
}
export default Config;
