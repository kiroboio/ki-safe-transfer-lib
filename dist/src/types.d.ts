export declare enum Currencies {
    Bitcoin = "btc"
}
export declare enum Networks {
    Testnet = "testnet",
    Regnet = "regnet"
}
export declare enum DebugLevels {
    MUTE = 0,
    QUIET = 1,
    VERBOSE = 2
}
export declare type Settings = {
    debug: DebugLevels;
    currency: Currencies;
    network: Networks;
    version: string;
    respond?: Responses;
};
export declare enum Endpoints {
    Collect = "collect",
    Inbox = "inbox",
    Transfers = "transfers",
    Networks = "networks"
}
export interface ApiService {
    find: (arg0?: any) => any;
    get: (arg0: any) => any;
    create: (arg0: {}) => any;
    on: (arg0: string, arg1: (arg2: any) => any) => any;
}
export interface ApiResponseError {
    className: string;
    code: number;
    data: [];
    errors: {};
    message: string;
    name: string;
    type: string;
}
export interface NetworkTip {
    height: number;
    online: boolean;
    netId: string;
    timestamp: number;
}
export declare type Retrievable = {
    amount: number;
    collect: {
        broadcasted: number;
        confirmed: number;
        txid: string;
    };
    createdAt: string;
    deposit: {
        txid: string;
        vout: number;
    };
    expires: {
        at: string;
    };
    id: string;
    state: string;
    to: string;
    updatedAt: string;
};
export declare type Collectable = {
    amount: number;
    collect: {
        broadcasted: number;
        confirmed: number;
        txid: string;
    };
    createdAt: string;
    expires: {
        at: string;
    };
    id: string;
    salt: string;
    state: string;
    to: string;
    updatedAt: string;
};
export declare type ResponseCollectable = {
    total: number;
    limit: number;
    skip: number;
    data: Collectable[];
};
export declare type ResponseCollect = {
    fromNodeTxid: string;
};
export interface ConfigProps {
    debug?: DebugLevels;
    currency?: Currencies;
    network?: Networks;
    eventBus?: EventBus;
    respond?: Responses;
}
export declare enum Responses {
    Callback = "callback",
    Direct = "direct"
}
export declare enum Logger {
    Error = 0,
    Info = 1,
    Warning = 2
}
export interface LoggerProps {
    type: Logger;
    payload?: Status | Retrievable | Collectable[] | ResponseCollect;
    message: string;
}
export declare enum EventTypes {
    GET_RETRIEVABLE = "service_get_retrievable",
    GET_COLLECTABLES = "service_get_collectables",
    UPDATE_STATUS = "service_update_status",
    SEND_TRANSACTION = "service_send_transaction",
    COLLECT_TRANSACTION = "service_collect_transaction",
    UPDATED_RETRIEVABLE = "service_updated_retrievable",
    UPDATED_COLLECTABLE = "service_updated_collectable",
    REMOVED_COLLECTABLE = "service_removed_collectable",
    CREATED_COLLECTABLE = "service_created_collectable"
}
export declare type Status = {
    height: number;
    online: boolean;
};
export declare type Event = {
    type: EventTypes;
    payload: Status | Retrievable | Collectable | Collectable[] | ResponseCollect;
};
export declare type EventBus = {
    (arg0: Event): void;
};
export interface ServiceProps extends ConfigProps {
}
export declare type Sendable = {
    amount: number;
    collect: string;
    deposit: string;
    from?: string;
    hint?: string;
    id?: string;
    to: string;
};
export declare type CollectRequest = {
    id: string;
    key: string;
};
export declare type validateReport = {
    message: string;
    errors: {
        [index: string]: string[];
    };
};
