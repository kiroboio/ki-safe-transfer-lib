const ERRORS = {
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
}

const WARNINGS = {
  connect: {
    disconnect: 'Service is disconnected.',
  },
}

export { ERRORS, WARNINGS }
