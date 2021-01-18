import { modeIs } from './tools/mode';

const connectionTriesMax = 3;

const connectionTimeout = modeIs('test') ? 1 : 10;

const version = 'v1' as const;

const apiUrl: string = 'https://api.kirobo.me' as const;

const endpoints: Record<string, string> = {
  collect: 'action/collect',
  retrieve: 'action/retrieve',
  inbox: 'collectables',
  transfers: 'transfers',
  utxos: 'utxos',
  exists: 'exists',
  transactions: 'transactions',
  kiros: 'kiros',
  kiroPrice: 'kiro/price',
  kiroBuy: 'kiro/buy',
  balance: 'balance',
  estimateFees: 'transfer/fees',
  ethTransferRequest: 'transfer/request',
  follow: 'action/follow',
} as const;

export { version, apiUrl, endpoints, connectionTriesMax, connectionTimeout };
