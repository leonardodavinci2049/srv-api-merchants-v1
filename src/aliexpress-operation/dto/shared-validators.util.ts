import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { ALIEXPRESS_ALLOWED_SOURCE_HOSTS } from 'src/aliexpress-api/aliexpress-api.constants';

/**
 * Splits a comma-separated string into trimmed, non-empty tokens. Returns an
 * empty array when the input is empty.
 */
export function splitList(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

@ValidatorConstraint({ name: 'isCommaSeparatedList', async: false })
class IsCommaSeparatedListConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (value === undefined || value === null || value === '') return false;
    if (typeof value !== 'string') return false;
    const max = args.constraints[0] as number | undefined;
    const tokens = splitList(value);
    if (tokens.length === 0) return false;
    if (max !== undefined && tokens.length > max) return false;
    return tokens.every((token) => !/\s/.test(token) && !token.includes(','));
  }

  defaultMessage(args: ValidationArguments): string {
    const max = args.constraints[0] as number | undefined;
    return max !== undefined
      ? `${args.property} must be a comma-separated list of at most ${max} non-empty values`
      : `${args.property} must be a non-empty comma-separated list`;
  }
}

/**
 * Validates that a property is a comma-separated list of non-empty tokens,
 * optionally bounded by `maxItems`.
 */
export function IsCommaSeparatedList(
  maxItems?: number,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isCommaSeparatedList',
      target: object.constructor,
      propertyName,
      constraints: [maxItems],
      options: validationOptions,
      validator: IsCommaSeparatedListConstraint,
    });
}

@ValidatorConstraint({ name: 'isAliExpressSourceList', async: false })
class IsAliExpressSourceListConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const urls = splitList(value);
    if (urls.length === 0) return false;
    return urls.every((url) => isAllowedAliExpressUrl(url));
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must contain only URLs on the allowed AliExpress hosts`;
  }
}

/**
 * Validates a comma-separated list of AliExpress source URLs. Each entry must
 * be a syntactically valid HTTPS/HTTP URL whose host is one of the documented
 * AliExpress domains. Redirects are never followed by this validator.
 */
export function IsAliExpressSourceList(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isAliExpressSourceList',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsAliExpressSourceListConstraint,
    });
}

function isAllowedAliExpressUrl(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return false;
  }
  return ALIEXPRESS_ALLOWED_SOURCE_HOSTS.includes(
    parsed.hostname.toLowerCase() as (typeof ALIEXPRESS_ALLOWED_SOURCE_HOSTS)[number],
  );
}
