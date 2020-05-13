import { TEXT } from '../data'
import { Sendable, ValidateReport, Retrieve } from '../types'
import { validateAddress } from './address'
import { not, is, includes, forEach } from 'ramda'
import { makeString } from '../tools'
import { ERRORS } from '../text'

 const validateData = (data: Sendable, currency: string, networkType: string): void => {
  const validate: ValidateReport = {
    message: TEXT.errors.validation.malformedData,
    errors: { [TEXT.errors.validation.missingValues]: [], [TEXT.errors.validation.malformedValues]: [] },
  }

  const pushMissing = (subject: string): number => validate.errors[TEXT.errors.validation.missingValues].push(subject)

  const pushMalformed = (subject: string): number =>
    validate.errors[TEXT.errors.validation.malformedValues].push(subject)

  // checking for missing required values
  if (!data.to) pushMissing('to')

  if (!data.amount) pushMissing('amount')

  if (!data.collect) pushMissing('collect')

  if (!data.deposit) pushMissing('deposit')

  if (!data.owner) pushMissing('owner')

  // if all keys present, check for malformed values
  if (!validate.errors[TEXT.errors.validation.missingValues].length) {
    if (!validateAddress({ address: data.to, currency, networkType })) pushMalformed('to')

    if (typeof data.collect !== 'string') pushMalformed('collect')

    if (typeof data.deposit !== 'string') pushMalformed('deposit')

    if (typeof data.amount !== 'number') pushMalformed('amount')

    if (typeof data.owner !== 'string') pushMalformed('owner')

    if (data.from && typeof data.from !== 'string') pushMalformed('from')

    if (data.hint && typeof data.hint !== 'string') pushMalformed('hint')

    if (data.id && typeof data.id !== 'string') pushMalformed('id')

    if (data.depositPath && typeof data.depositPath !== 'string') pushMalformed('depositPath')
  } else delete validate.errors[TEXT.errors.validation.malformedValues]

  const throwError = (): boolean =>
    validate.errors[TEXT.errors.validation.missingValues].length > 0 ||
    validate.errors[TEXT.errors.validation.malformedValues].length > 0

  // if status false throw error
  if (throwError()) {
    Object.keys(validate.errors).forEach(key => {
      if (validate.errors[key].length > 0) {
        validate.message = `${validate.message} ${key}${validate.errors[key].join(', ')}.`
      }
    })
    throw new TypeError(validate.message)
  }
}

function validateRetrieve(data: Retrieve,argName: string, fnName: string): void {

  const allowedKeys = ['id','raw']

  const checkFn = (key: string): void => {
    if (!allowedKeys.includes(key)) throw new Error(makeString(ERRORS.validation.extraKey,[key,argName,fnName]))
  }

  forEach(checkFn,Object.keys(data))

  if (!data.id ) throw new Error(makeString(ERRORS.validation.missingKey,['id', argName, fnName]))

  if (!data.raw) throw new Error(makeString(ERRORS.validation.missingKey, ['raw', argName, fnName]))

  if (not(is(String,data.id))) throw new TypeError(makeString(ERRORS.validation.wrongTypeKey, ['id', argName, fnName,'string']))

  if (not(is(String,data.raw))) throw new TypeError(makeString(ERRORS.validation.wrongTypeKey, ['raw', argName, fnName,'string']))
}

export {validateRetrieve, validateData}