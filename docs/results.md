# Results

[◅ _return to documentation_](api.md)

## Results Object with Data

Requests for single result ([getSettings()](api.md#getsettings), [getStatus()](api.md#async-getstatus) & etc ) are responded with object, for example:
```typescript
Record<string, unknown>
```
or
```typescript
interface NetworkTip {
  height: number
  online: boolean
  netId: string
  timestamp: number
  fees: number[]
  fee: number
  updatedAt: string | Date
}
```
While requests with potentially multiple results are returned as part of Result object with paging meta data:

```typescript
interface Paging {
  total: number
  skip: number
  limit: number
}

interface Results<T> extends Paging {
  data: Array<T>
}
```
which provide the total quantity of results, skip & limit (if set in [query options](query_options.md#paging)).


[⬑ _to top_](#results)

[◅ _return to documentation_](api.md)
