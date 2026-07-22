import {
  ALIEXPRESS_PROTOCOL,
  type AliExpressOperationName,
} from '../aliexpress-api.constants';
import type {
  AliExpressOperationParams,
  AliExpressParameters,
  AliExpressSystemParams,
} from '../interfaces/aliexpress-api.interface';
import { signRequest } from './aliexpress-signature.util';

const TIMESTAMP_PAD = 3;

/**
 * Generates the AliExpress millisecond timestamp as a string. Three trailing
 * zero-biased digits are appended so the value mirrors the documented
 * `1761560753144` shape used by the production gateway.
 */
export function createTimestamp(now: () => Date = () => new Date()): string {
  return `${Math.floor(now().getTime() / 1000)}${'0'.repeat(TIMESTAMP_PAD)}`;
}

/**
 * Builds the system parameters shared by every AliExpress request. The
 * `method` is the documented System Interface operation name.
 */
export function buildSystemParams(
  operation: AliExpressOperationName,
  appKey: string,
  timestamp: string,
): Omit<AliExpressSystemParams, 'sign'> {
  return {
    app_key: appKey,
    format: ALIEXPRESS_PROTOCOL.FORMAT,
    method: operation,
    partner_id: ALIEXPRESS_PROTOCOL.PARTNER_ID,
    sign_method: ALIEXPRESS_PROTOCOL.SIGN_METHOD,
    timestamp,
    v: ALIEXPRESS_PROTOCOL.VERSION,
  };
}

/**
 * Merges system and operation parameters, signs the combined payload, and
 * returns the final `application/x-www-form-urlencoded` body ready to be sent
 * to the production gateway.
 */
export function buildSignedFormBody(options: {
  operation: AliExpressOperationName;
  appKey: string;
  appSecret: string;
  operationParams?: AliExpressOperationParams;
  timestamp?: string;
}): { body: string; systemParams: AliExpressSystemParams } {
  const { operation, appKey, appSecret, operationParams = {} } = options;
  const timestamp = options.timestamp ?? createTimestamp();
  const systemParams = buildSystemParams(operation, appKey, timestamp);
  const combined: AliExpressParameters = {
    ...systemParams,
    ...operationParams,
  };
  const sign = signRequest(operation, combined, appSecret);
  const finalParams: AliExpressParameters = { ...combined, sign };
  return {
    body: encodeFormUrl(finalParams),
    systemParams: { ...systemParams, sign },
  };
}

/**
 * Encodes a parameter map as `application/x-www-form-urlencoded`. `URLSearchParams`
 * is used to guarantee correct escaping without exposing the secret material.
 */
export function encodeFormUrl(params: AliExpressParameters): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.set(key, normalizeFormValue(value));
  }
  return search.toString();
}

function normalizeFormValue(value: string | number | boolean): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}
