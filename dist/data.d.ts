import { ObjectWithStringKeys, ObjectWithStringKeysAnyValues } from './types';
export declare const TEXT: {
    errors: {
        validation: {
            missingArgument: string;
            emptyObject: string;
            extraKeys: string;
            noArray: string;
            noFunction: string;
            typeOfObject: string;
            unknownKeys: string;
            wrongValueType: string;
            wrongValue: string;
            malformedData: string;
            malformedAddress: string;
            missingValues: string;
            malformedValues: string;
        };
    };
};
export declare const listOfStatusKeys: ObjectWithStringKeysAnyValues;
export declare const typeOfStatusValues: ObjectWithStringKeysAnyValues;
export declare const listOfSettingsKeys: string[];
export declare const typeOfSettingsKeys: ObjectWithStringKeys;
export declare const valuesForSettings: ObjectWithStringKeys;
export declare const validBitcoinAddresses: string[];
