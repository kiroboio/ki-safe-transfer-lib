// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyValue = any;

export type Either<T, K> = T | K;

export type Maybe<T> = T | undefined | null;

export interface AuthDetails {
  key: string;
  secret: string;
}

export interface ApiService {
  find: (arg0?: unknown) => AnyValue;
  get: (arg0: unknown) => AnyValue;
  create: (arg0: Record<string, unknown>) => AnyValue;
  on: (arg0: string, arg1: (arg2: AnyValue) => AnyValue) => AnyValue;
}
