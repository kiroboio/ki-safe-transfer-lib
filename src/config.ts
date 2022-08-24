export const connectionTriesMax = 3;

export const connectionTimeout = process.env.NODE_ENV === 'test' ? 1 : 10;

export const apiUrl: string = 'https://testapi.kirobo.me' as const;
