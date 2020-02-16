import { Sendable } from './types';
interface Props {
    address: string;
    currency: string;
    networkType: string;
}
export declare const validateAddress: ({ address, currency, networkType }: Props) => boolean;
export declare const validateData: (data: Sendable, currency: string, networkType: string) => void;
export declare const validateArray: (arr: unknown[], type: string[]) => boolean;
export declare const validateObject: (data: unknown) => void;
export declare const validateSettings: (settings: unknown) => void;
export {};
