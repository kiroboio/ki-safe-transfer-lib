export declare type AnyValue = any;
export declare type Either<T, K> = T | K;
export declare type Maybe<T> = T | undefined | null;
export interface AuthDetails {
    key: string;
    secret: string;
}
export interface BroadcastConfirmation {
    broadcasted: number;
    confirmed: number;
    txid: string;
}
export interface EthTransfer {
    collect: BroadcastConfirmation;
    createdAt: string;
    expires: {
        at: string;
    };
    fees: string;
    from: string;
    id: string;
    message: string;
    retrieve: BroadcastConfirmation;
    salt: string;
    secretHash: string;
    state: string;
    to: string;
    updatedAt: string;
    value: string;
}
export declare enum RatesSources {
    BITFINEX = "bitfinex.com",
    BLOCKCHAIN = "blockchain.info",
    COINGECKO = "coingecko.com"
}
export interface ExchangeRate {
    source: RatesSources;
    timestamp: number;
    online: boolean;
    value: number;
}
export declare enum Watch {
    DISABLE = "disable",
    ADD = "add",
    REPLACE = "replace",
    IGNORE = "ignore"
}
export interface NetworkTip {
    height: number;
    online: boolean;
    netId: string;
    timestamp: number;
    fees: number[];
    fee: number;
    updatedAt: string | Date;
}
export interface Contract {
    address: string;
    synced: true;
}
export interface EthNetworkItem {
    height: number;
    online: boolean;
    netId: string;
    timestamp: number;
    updatedAt: string;
    contracts: Record<string, Contract>;
}
export interface BtcTransfer {
    amount: number;
    collect: {
        broadcasted: number;
        confirmed: number;
        txid: string;
    };
    createdAt: string | Date;
    deposit: {
        address: string;
        path?: string;
        txid: string;
        value: number;
        vout: number;
    };
    expires: {
        at?: string | Date;
        block?: number;
    };
    from?: string;
    hint?: string;
    id: string;
    owner: string;
    state: 'waiting-for-deposit' | 'retrieved' | 'ready' | 'collecting' | 'collected' | 'rejected' | 'invalid' | 'new';
    to: string;
    updatedAt: string | Date;
    transferFees?: TransferFees;
}
export interface TransferFees {
    kiro?: {
        from: string;
        value: string;
        v: string;
        r: string;
        s: string;
    };
    btc?: {
        to: string;
        value: number;
    };
}
export interface EventBusMessage {
    type: string;
    payload: unknown;
}
export declare type EventBus = (message: EventBusMessage) => void;
export interface EventBusProps {
    eventBus: EventBus;
    type: string;
}
export interface Results<T = unknown> {
    data: T[];
    limit: number;
    skip: number;
    total: number;
}
export declare type MessageCallback = (message: string, payload?: unknown) => void;
export interface EthTransferResponse {
    from: string;
    to: string;
    value: string;
    secretHash: string;
    publicSalt: string;
    createdAt: string;
    expiresAt: string;
    id: string;
    fees: string;
}
