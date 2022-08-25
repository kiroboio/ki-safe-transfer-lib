"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MESSAGES = exports.WARNINGS = exports.ERRORS = void 0;
exports.ERRORS = {
    connect: {
        authenticate: 'Service (authSocket > authenticate) caught error when calling (getStatus).',
        reAuthenticate: 'Service (authSocket > reAuthenticate) caught error.',
        authSocket: 'Service (authSocket) caught error.',
        on: {
            connect: {
                direct: 'Service (onConnect) caught error.',
                authSocket: 'Service (authSocket on connect) caught error.',
            },
            disconnect: {
                direct: 'Service (onDisConnect) caught error.',
            },
        },
    },
    service: {
        failedAuth: 'Service failed to authenticate, updating connectionCounter.',
        failedTo: 'Service (%1) failed to %2, proceeding with %3.',
    },
    validation: {
        missingArgument: 'Data is missing',
        malformedData: 'Data is malformed.',
        noFunction: "Argument can't be a function.",
        typeOfObject: 'Wrong type of argument',
        unknownKeys: 'Unknown key in settings: ',
        missingValues: 'Missing values: ',
    },
};
exports.WARNINGS = {
    connect: {
        disconnect: 'Service is disconnected.',
    },
};
exports.MESSAGES = {
    validation: {
        cantBe: "%1 can't be %2. It should be %3.",
    },
    technical: {
        isAllowed: 'Function is allowed ッ',
        notAllowed: 'Function is not allowed ꈌ',
        proceedingWith: 'Function (%1) proceeding with %2...',
        running: 'Function (%1) is running.',
        serviceIs: 'Function is %1...',
        connection: {
            wontReconnect: "Service was manually disconnected, won't reconnect",
            exceeded: 'Service exceeded connectionTriesMax (%1/%2).',
            willConnect: 'Connection is offline, but service is not - will disconnect.',
            willReConnect: 'Browser connection is online,but service is not - will re-connect.',
            willNotReconnect: 'Browser connection is online, but service is not - service exceeded connectionTriesMax, will not re-connect.',
        },
    },
};
//# sourceMappingURL=text.js.map