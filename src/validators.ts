import validator from 'multicoin-address-validator'
import { Sendable, validateReport } from './types'

const isString = (data: unknown) => typeof data === 'string'

interface Props {
  address: string
  currency: string
  networkType: string
}

export const validateAddress = ({ address, currency, networkType }: Props): boolean =>
  isString(address) ? validator.validate(address, currency, networkType) : false

export const validateData = (data: Sendable, currency: string, networkType: string): void => {
  const validate: validateReport = {
    message: 'Data is malformed.',
    errors: { 'Missing values:': [], 'Malformed values:': [] },
  }

  const pushMissing = (subject: string) => validate.errors['Missing values:'].push(subject)

  const pushMalformed = (subject: string) => validate.errors['Malformed values:'].push(subject)

  // checking for missing values
  if (!data.to) pushMissing('to')
  if (!data.amount) pushMissing('amount')
  if (!data.collect) pushMissing('collect')
  if (!data.deposit) pushMissing('deposit')

  // checking for malformed values
  // if (data.to && !data.to.match(/^[a-z0-9]+$/i)) validate.errors['Malformed values:'].push('to')
  if (!validateAddress({ address: data.to, currency, networkType })) pushMalformed('to')
  if (typeof data.collect !== 'string') pushMalformed('collect')
  if (typeof data.deposit !== 'string') pushMalformed('deposit')
  if (data.from && typeof data.from !== 'string') pushMalformed('from')
  if (data.hint && typeof data.hint !== 'string') pushMalformed('hint')

  const throwError = () =>
    validate.errors['Missing values:'].length > 0 || validate.errors['Malformed values:'].length > 0

  // if status false throw error
  if (throwError()) {
    Object.keys(validate.errors).forEach(key => {
      if (validate.errors[key].length > 0) {
        validate.message = `${validate.message} ${key} ${validate.errors[key].join(', ')}.`
      }
    })
    throw new Error(validate.message)
  }
}
