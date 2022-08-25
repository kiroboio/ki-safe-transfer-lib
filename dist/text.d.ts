export declare const ERRORS: {
    connect: {
        authenticate: string;
        reAuthenticate: string;
        authSocket: string;
        on: {
            connect: {
                direct: string;
                authSocket: string;
            };
            disconnect: {
                direct: string;
            };
        };
    };
    service: {
        failedAuth: string;
        failedTo: string;
    };
    validation: {
        missingArgument: string;
        malformedData: string;
        noFunction: string;
        typeOfObject: string;
        unknownKeys: string;
        missingValues: string;
    };
};
export declare const WARNINGS: {
    connect: {
        disconnect: string;
    };
};
export declare const MESSAGES: {
    validation: {
        cantBe: string;
    };
    technical: {
        isAllowed: string;
        notAllowed: string;
        proceedingWith: string;
        running: string;
        serviceIs: string;
        connection: {
            wontReconnect: string;
            exceeded: string;
            willConnect: string;
            willReConnect: string;
            willNotReconnect: string;
        };
    };
};
