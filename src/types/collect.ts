/**
 * Describes a request to collect transaction
 *
 * @interface
 * @name CollectRequest
 */
interface CollectRequest {
  id: string; // transaction ID to collect
  key: string; // encrypted key from passcode
}

/**
 * Describes a Collectable object, received from API
 *
 * @interface
 * @name Collectable
 */
interface Collectable {
  amount: number; // the transfer amount in satoshi
  collect: // collect info,
  {
    broadcasted: number; // blockchain height
    confirmed: number; // block number of confirmed transaction
    txid: string; // the tx id of the transaction
  };
  createdAt: string;
  expires: {
    at?: string | Date;
    block?: number;
  };
  from?: string; // senders attached message
  hint?: string; // senders attached passcode hint
  id: string; // unique id
  salt: string; // salt use to encrypt the 'collect' transaction
  state: 'ready' | 'collecting' | 'collected'; // collect state
  to: string; // the destination address
  updatedAt: string;
}

export { CollectRequest, Collectable };
