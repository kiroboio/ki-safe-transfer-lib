import { not, is, forEach, keys, isNil, append, filter } from 'ramda'

import { DataSpec, MinMax, RetrieveRequest } from '..'
import { changeType, makeString } from '../tools'
import { makeStringFromArray } from '../tools/string'
import { ERRORS } from '../text'
import { BuyKiroWithEthRequest, EstimateFeeRequest, EthTransferRequest } from 'src/types'
import { isHex } from 'web3-utils'

function isMin(value: number, min: number): boolean {
  return value >= min
}

function isMax(value: number, max: number): boolean {
  return value <= max
}

function validateSend(data: unknown, spec: DataSpec, dataSetName: string): void {
  // check types argument type
  if (not(is(String, dataSetName)) || isNil(dataSetName)) throw new TypeError('dataSetName is not string or empty')

  if (not(Object(data) === data) || isNil(dataSetName)) throw new TypeError(`${dataSetName} is not an obj or empty`)

  if (not(Object(spec) === spec) || isNil(spec)) throw new TypeError('spec is not an obj or empty')

  // assign variables
  const dataObject = changeType<Record<string, string | number>>(data)

  const dataKeys = keys(data) as string[]

  const validKeys = keys(spec) as string[]

  let wrongKeys: string[] = []
  let wrongTypes: string[][] = []
  let wrongValues: string[][] = []
  let missingRequired: string[] = []

  // check keys/types
  const checkKeyType = (key: string): void => {
    if (not(validKeys.includes(key))) wrongKeys = append(key, wrongKeys)
    else if (not(typeof dataObject[key] === spec[key].type) || isNil(dataObject[key]))
      wrongTypes = append([key, `should be ${spec[key].type}`], wrongTypes)
    else if (not(isNil(spec[key].length))) {
      const minMax = spec[key].length as MinMax

      if (
        not(isNil(minMax.min)) &&
        isNil(minMax.max) &&
        not(isMin((dataObject[key] as string).length, minMax.min as number))
      )
        wrongValues = append([key, `should be longer or equal to ${minMax.min}`], wrongValues)

      if (
        isNil(minMax.min) &&
        not(isNil(minMax.max)) &&
        not(isMax((dataObject[key] as string).length, minMax.max as number))
      )
        wrongValues = append([key, `should be shorter or equal to ${minMax.min}`], wrongValues)

      if (
        not(isNil(minMax.min)) &&
        not(isNil(minMax.max)) &&
        (not(isMin((dataObject[key] as string).length, minMax.min as number)) ||
          not(isMax((dataObject[key] as string).length, minMax.max as number)))
      )
        wrongValues = append([key, `should be between ${minMax.min} and ${minMax.max}`], wrongValues)
    }
  }

  forEach(checkKeyType, dataKeys)

  const filterRequired = (key: string): boolean => spec[key].required ?? false

  const filterCorrect = (key: string): boolean => validKeys.includes(key) ?? false

  // check required keys
  const required = filter(filterRequired, validKeys)

  const correct = filter(filterCorrect, dataKeys)

  const checkRequired = (key: string): void => {
    if (not(correct.includes(key))) missingRequired = append(key, missingRequired)
  }

  forEach(checkRequired, required)

  let result = ''

  if (wrongKeys.length) result = `Wrong keys present: ${wrongKeys.join(', ')}.`

  if (wrongTypes.length)
    result = `${result ? `${result} ` : ''}Wrong types of keys: ${makeStringFromArray(wrongTypes)}.`

  if (wrongValues.length) result = `${result ? `${result} ` : ''}Wrong values: ${makeStringFromArray(wrongValues)}.`

  if (missingRequired.length)
    result = `${result ? `${result} ` : ''}Missing required keys: ${missingRequired.join(', ')}.`

  if (result) throw new TypeError(result)
}

//  const validateSend = (data: SendRequest, currency: string, networkType: string): void => {
//   const validate: ValidateReport = {
//     message: TEXT.errors.validation.malformedData,
//     errors: { [TEXT.errors.validation.missingValues]: [], [TEXT.errors.validation.malformedValues]: [] },
//   }

//   const pushMissing = (subject: string): number => validate.errors[TEXT.errors.validation.missingValues].push(subject)

//   const pushMalformed = (subject: string): number =>
//     validate.errors[TEXT.errors.validation.malformedValues].push(subject)

//   const sendKeys = keys(data)
// const validKeys = keys()

//   // checking for missing required values
//   if (!data.to) pushMissing('to')

//   if (!data.amount) pushMissing('amount')

//   if (!data.collect) pushMissing('collect')

//   if (!data.deposit) pushMissing('deposit')

//   if (!data.owner) pushMissing('owner')

//   // if all keys present, check for malformed values
//   if (!validate.errors[TEXT.errors.validation.missingValues].length) {
//     if (!validateAddress({ address: data.to, currency, networkType })) pushMalformed('to')

//     if (typeof data.collect !== 'string') pushMalformed('collect')

//     if (typeof data.deposit !== 'string') pushMalformed('deposit')

//     if (typeof data.amount !== 'number') pushMalformed('amount')

//     if (typeof data.owner !== 'string') pushMalformed('owner')

//     if (data.from && typeof data.from !== 'string') pushMalformed('from')

//     if (data.hint && typeof data.hint !== 'string') pushMalformed('hint')

//     if (data.depositPath && typeof data.depositPath !== 'string') pushMalformed('depositPath')
//   } else delete validate.errors[TEXT.errors.validation.malformedValues]

//   const throwError = (): boolean =>
//     validate.errors[TEXT.errors.validation.missingValues].length > 0 ||
//     validate.errors[TEXT.errors.validation.malformedValues].length > 0

//   // if status false throw error
//   if (throwError()) {
//     Object.keys(validate.errors).forEach(key => {
//       if (validate.errors[key].length > 0) {
//         validate.message = `${validate.message} ${key}${validate.errors[key].join(', ')}.`
//       }
//     })
//     throw new TypeError(validate.message)
//   }
// }

function validateRetrieve(data: RetrieveRequest, argName: string, fnName: string): void {
  const allowedKeys = ['id', 'raw']

  const checkFn = (key: string): void => {
    if (!allowedKeys.includes(key)) throw new Error(makeString(ERRORS.validation.extraKey, [key, argName, fnName]))
  }

  forEach(checkFn, Object.keys(data))

  if (!data.id) throw new Error(makeString(ERRORS.validation.missingKey, ['id', argName, fnName]))

  if (!data.raw) throw new Error(makeString(ERRORS.validation.missingKey, ['raw', argName, fnName]))

  if (not(is(String, data.id)))
    throw new TypeError(makeString(ERRORS.validation.wrongTypeKey, ['id', argName, fnName, 'string']))

  if (not(is(String, data.raw)))
    throw new TypeError(makeString(ERRORS.validation.wrongTypeKey, ['raw', argName, fnName, 'string']))
}

function validateEstimateFeesRequest(data: Partial<EstimateFeeRequest>, argName: string, fnName: string): void {
  const allowedKeys = ['ownerId', 'to', 'amount']

  const checkFn = (key: string): void => {
    if (!allowedKeys.includes(key)) throw new Error(makeString(ERRORS.validation.extraKey, [key, argName, fnName]))
  }

  forEach(checkFn, Object.keys(data))

  if (!data.ownerId) throw new Error(makeString(ERRORS.validation.missingKey, ['ownerId', argName, fnName]))

  if (!data.to) throw new Error(makeString(ERRORS.validation.missingKey, ['to', argName, fnName]))

  if (!data.amount) throw new Error(makeString(ERRORS.validation.missingKey, ['amount', argName, fnName]))

  if (not(is(String, data.ownerId)))
    throw new TypeError(makeString(ERRORS.validation.wrongTypeKey, ['ownerId', argName, fnName, 'string']))

  if (not(is(String, data.to)))
    throw new TypeError(makeString(ERRORS.validation.wrongTypeKey, ['to', argName, fnName, 'string']))

  if (not(is(Number, data.amount)))
    throw new TypeError(makeString(ERRORS.validation.wrongTypeKey, ['amount', argName, fnName, 'number']))
}

function validateBuyKiroRequest(data: Partial<BuyKiroWithEthRequest>, argName: string, fnName: string): void {
  const allowedKeys = ['eth']

  const checkFn = (key: string): void => {
    if (!allowedKeys.includes(key)) throw new Error(makeString(ERRORS.validation.extraKey, [key, argName, fnName]))
  }

  forEach(checkFn, Object.keys(data))

  if (!data.eth) throw new Error(makeString(ERRORS.validation.missingKey, ['eth', argName, fnName]))

  if (!data.eth?.raw) throw new Error(makeString(ERRORS.validation.missingKey, ['eth.raw', argName, fnName]))

  if (not(is(String, data.eth?.raw)))
    throw new TypeError(makeString(ERRORS.validation.wrongTypeKey, ['eth.raw', argName, fnName, 'string']))
}

// {
//   "from": "(string: address)",
//   "to": "(string: address)",
//   "value":"(string: whole number)",
//   "secretHash": "(string: 64 char hex starting with 0x - total length 66)",
//   "publicSalt":"(string: min length 20)",
//   "privateSalt":"(string: min length 20)"
//   }
function validateEthTransferRequest(data: EthTransferRequest, argName: string, fnName: string): void {
  const allowedKeys = ['from', 'to', 'value', 'secretHash', 'publicSalt', 'privateSalt']

  const checkFn = (key: string): void => {
    if (!allowedKeys.includes(key)) throw new Error(makeString(ERRORS.validation.extraKey, [key, argName, fnName]))
  }

  forEach(checkFn, Object.keys(data))

  ;(allowedKeys as (keyof EthTransferRequest)[]).forEach(key => {
    if (!data[key]) throw new Error(makeString(ERRORS.validation.missingKey, [key, argName, fnName]))
  })

  ;(Object.keys(data) as (keyof EthTransferRequest)[]).forEach(key => {
    if (not(is(String, data[key]))) throw new TypeError(makeString(ERRORS.validation.wrongTypeKey, [key, argName, fnName, 'string']))
  })

  if (!isHex(data.secretHash) || data.secretHash.length !== 66) 
    throw new Error(makeString(ERRORS.validation.wrongTypeArgument, ['secretHash', argName, fnName, 'not a valid 66 char hex']))
  
  if (data.publicSalt.length < 20)
    throw new Error(makeString(ERRORS.validation.wrongTypeArgument, ['publicSalt', argName, fnName, 'public salt too short']))
  
  if (data.privateSalt.length < 20)
    throw new Error(makeString(ERRORS.validation.wrongTypeArgument, ['privateSalt', argName, fnName, 'private salt too short']))
 
}

export { validateRetrieve, validateSend, validateEstimateFeesRequest, validateBuyKiroRequest, validateEthTransferRequest }
