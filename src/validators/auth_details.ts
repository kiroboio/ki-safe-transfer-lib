import { authDetailsData } from '../data';
import { validateObject } from '.';
import { ERRORS } from '../text';

export function validateAuthDetails(details: unknown): void {
  if (!details) throw new TypeError(`${ERRORS.validation.missingArgument}: authDetails.`);

  validateObject(details);

  const objKeys = Object.keys(details as Record<string, string>);

  if (objKeys.length !== 2) {
    throw new TypeError(`${ERRORS.validation.malformedData} [authDetails] has less or extra keys.`);
  }

  Object.keys(authDetailsData).forEach(key => {
    if (!objKeys.includes(key)) throw new TypeError(`${ERRORS.validation.missingValues}${key} (authdetails).`);
  });

  objKeys.forEach(key => {
    const value = (details as Record<string, string>)[key];

    if (!authDetailsData[key]) {
      throw new TypeError(`${ERRORS.validation.unknownKeys}${key} (authdetails).`);
    }

    if (!value) {
      throw new TypeError(`${ERRORS.validation.missingValues}${key} (authdetails).`);
    }

    if (typeof value !== authDetailsData[key]) {
      throw new TypeError(
        `${ERRORS.validation.typeOfObject}: ${key} can't be of type ${typeof value}, if should be of ${
          authDetailsData[key]
        } type (authdetails).`,
      );
    }
  });
}
