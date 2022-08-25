import { ApiError } from '../types/error';
export declare enum LogTypes {
    ERROR = "error",
    INFO = "info",
    WARNING = "warn"
}
export declare class Log {
    private _payload;
    private _message;
    private _type;
    private readonly _log;
    constructor(type: LogTypes, message: string, payload?: unknown);
    make(): void;
}
export declare class LogApiError extends Log {
    constructor(message: string, error?: ApiError | undefined);
}
export declare class LogApiWarning extends Log {
    constructor(message: string, payload: unknown | undefined);
}
export declare class LogInfo extends Log {
    constructor(message: string, payload: unknown | undefined);
}
