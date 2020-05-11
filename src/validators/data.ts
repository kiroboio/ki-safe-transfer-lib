import { Sendable, validateReport, validateAddress } from '..'
import { TEXT } from '../data'

export const validateData = (data: Sendable, currency: string, networkType: string): void => {
  const validate: validateReport = {
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
