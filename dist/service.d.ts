import { Connect, ApiService } from './connect';
import { Maybe, AuthDetails, MessageCallback } from './types/types';
declare class Service extends Connect {
    private static instance;
    static getInstance(): Maybe<Service>;
    static createInstance(authDetails: AuthDetails, url?: string, messageCallback?: MessageCallback): Service;
    static disconnect(): void;
    private constructor();
}
export { Service, ApiService };
