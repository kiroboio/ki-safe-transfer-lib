import { endpoints, version } from '../config';
import { MakeServiceParameters } from '../types/fns';
import { Endpoints, QueryOptions, Responses } from '..';

/**
 * Helper to buildEndpointPath to help create paths for services, that are not relying on 'network' section
 *
 * @param { Endpoints } endpoint - endpoint in question
 *
 * @returns Boolean
 *
 */
function isDirect(endpoint: Endpoints): boolean {
  if (endpoint === Endpoints.Networks) return true;

  if (endpoint === Endpoints.RateToUsd) return true;

  return false;
}

/*
 * Build endpoint path
 *
 * @params { MakeServiceParameters } params - parameters, required to build the
 * path
 *
 * @return String
 *
 */
export function buildEndpointPath({ currency, network, endpoint }: MakeServiceParameters): string {
  const path = `/${version}/${currency}/`;

  if (isDirect(endpoint)) return path + endpoint;

  return path + `${network}/${endpoints[endpoint]}`;
}

/**
 * Function to determine if the reply should be sent directly back or through the eventBus
 *
 * @param [(QueryOptions | undefined)] options - options object
 *
 * @returns boolean
 *
 */
function shouldReturnDirect(options: QueryOptions | undefined, respondAs: Responses): boolean {
  if (options?.respondDirect) return true;

  if (!respondAs) return true;

  if (respondAs === Responses.Direct) return true;

  return false;
}

export { isDirect, shouldReturnDirect };
