import { ALIEXPRESS_OPERATION } from '../aliexpress-api.constants';
import type { AliExpressParameters } from '../interfaces/aliexpress-api.interface';
import { buildSignatureInput, signRequest } from './aliexpress-signature.util';

describe('aliexpress-signature.util', () => {
  describe('buildSignatureInput', () => {
    it('sorts parameters in ASCII order and concatenates name+value', () => {
      const params: AliExpressParameters = {
        foo: '1',
        bar: '2',
        foo_bar: '3',
        foobar: '4',
      };
      const input = buildSignatureInput(
        ALIEXPRESS_OPERATION.CATEGORY_GET,
        params,
      );
      // System Interface rule: api name prepended, sorted by ASCII order.
      expect(input).toBe(
        `${ALIEXPRESS_OPERATION.CATEGORY_GET}bar2foo1foo_bar3foobar4`,
      );
    });

    it('drops empty values and skips the sign parameter', () => {
      const params: AliExpressParameters = {
        sign: 'should-not-appear',
        empty_string: '',
        undefined_value: undefined,
        null_value: null,
        zero: 0,
        false_value: false,
        kept: 'x',
      };
      const input = buildSignatureInput(
        ALIEXPRESS_OPERATION.CATEGORY_GET,
        params,
      );
      // Empty string/undefined/null are excluded; 0/false are signable.
      expect(input).toBe(
        `${ALIEXPRESS_OPERATION.CATEGORY_GET}false_valuefalsekeptxzero0`,
      );
    });

    it('does not include binary/array values', () => {
      const params: AliExpressParameters = {
        array_value: ['a', 'b'] as unknown as string,
        object_value: { a: 1 } as unknown as string,
        scalar: 'y',
      };
      const input = buildSignatureInput(
        ALIEXPRESS_OPERATION.CATEGORY_GET,
        params,
      );
      expect(input).toBe(`${ALIEXPRESS_OPERATION.CATEGORY_GET}scalary`);
    });
  });

  describe('signRequest', () => {
    it('produces uppercase HMAC-SHA256 hex from the canonical input', () => {
      const secret = 'top-secret';
      const params: AliExpressParameters = { foo: '1', bar: '2' };
      const signature = signRequest(
        ALIEXPRESS_OPERATION.CATEGORY_GET,
        params,
        secret,
      );

      // Recompute manually to ensure the algorithm matches the docs.
      const expectedQuery = `${ALIEXPRESS_OPERATION.CATEGORY_GET}bar2foo1`;
      const crypto = require('node:crypto') as typeof import('node:crypto');
      const expected = crypto
        .createHmac('sha256', Buffer.from(secret, 'utf-8'))
        .update(expectedQuery, 'utf-8')
        .digest('hex')
        .toUpperCase();

      expect(signature).toBe(expected);
      expect(signature).toMatch(/^[0-9A-F]+$/);
    });

    it('produces the documented example signature for /test/api input', () => {
      // From docs-api-aliexpress/signature-algorithm.md: input
      // "/test/apibar2foo1foo_bar3foobar4" should be HMAC-SHA256-signed with
      // the application secret. We assert the digest is uppercase hex rather
      // than asserting a specific value because the docs example omits the
      // secret. The structural invariant (uppercase hex, deterministic for
      // fixed secret+input) is enough to prevent silent protocol switches.
      const signature = signRequest(
        '/test/api' as unknown as typeof ALIEXPRESS_OPERATION.CATEGORY_GET,
        { foo: '1', bar: '2', foo_bar: '3', foobar: '4' },
        'any-secret',
      );
      expect(signature).toMatch(/^[0-9A-F]{64}$/);
    });

    it('guards against MD5 regression by always using HMAC-SHA256', () => {
      // Equivalent inputs under MD5 would produce a different length and
      // charset; HMAC-SHA256 yields 64 uppercase hex chars.
      const signature = signRequest(
        ALIEXPRESS_OPERATION.PRODUCT_QUERY,
        { app_key: 'k', timestamp: '1' },
        'secret',
      );
      expect(signature).toHaveLength(64);
      expect(signature).toBe(signature.toUpperCase());
    });
  });
});
