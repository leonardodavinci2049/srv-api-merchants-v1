import { createHmac } from 'node:crypto';
import type { AliExpressOperationName } from '../aliexpress-api.constants';
import type { AliExpressParameters } from '../interfaces/aliexpress-api.interface';

const CHARSET_UTF8 = 'utf-8';

/**
 * Builds the canonical signature input string described in
 * `docs-api-aliexpress/signature-algorithm.md`:
 *
 * 1. Sort every text parameter (system + application) by ASCII name, excluding
 *    `sign` and binary values.
 * 2. Drop empty values.
 * 3. Concatenate names and values into a single string.
 * 4. Prepend the API operation name (System Interface signing rule).
 *
 * The returned string never contains the application secret; it is the exact
 * input fed to HMAC-SHA256.
 */
export function buildSignatureInput(
  operation: AliExpressOperationName,
  params: AliExpressParameters,
): string {
  const sortedKeys = Object.keys(params).sort();
  let query = operation;
  for (const key of sortedKeys) {
    if (key === 'sign') continue;
    const value = params[key];
    if (!isSignable(value)) continue;
    query += `${key}${value}`;
  }
  return query;
}

/**
 * Computes the AliExpress HMAC-SHA256 signature and returns it as uppercase
 * hexadecimal. The secret is consumed locally and never returned alongside the
 * signature.
 */
export function signRequest(
  operation: AliExpressOperationName,
  params: AliExpressParameters,
  appSecret: string,
): string {
  const query = buildSignatureInput(operation, params);
  const hmac = createHmac('sha256', Buffer.from(appSecret, CHARSET_UTF8));
  hmac.update(query, CHARSET_UTF8);
  return hmac.digest('hex').toUpperCase();
}

function isSignable(value: unknown): value is string | number | boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  return typeof value === 'boolean';
}
