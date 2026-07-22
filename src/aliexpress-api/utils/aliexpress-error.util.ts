import type { AxiosError } from 'axios';
import type {
  AliExpressErrorResponse,
  AliExpressOperationEnvelope,
  AliExpressRequestContext,
  AliExpressSkuDetailEnvelope,
  AliExpressTransportEnvelope,
} from '../interfaces/aliexpress-api.interface';

/** A normalized, secret-safe failure raised by the adapter. */
export class AliExpressProviderError extends Error {
  constructor(
    message: string,
    readonly context: AliExpressRequestContext,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AliExpressProviderError';
  }
}

/** Returns the documented envelope key for a given operation name. */
function envelopeKeyFor(operation: string): string {
  const normalized = operation.replace(/\./g, '_');
  return `${normalized}_response`;
}

/**
 * Verifies the standard `resp_result` envelope and returns the inner `result`.
 * Throws `AliExpressProviderError` for missing envelopes, unsuccessful
 * `resp_code`, or structurally invalid payloads.
 */
export function assertStandardResult(
  payload: AliExpressTransportEnvelope,
  operation: string,
  context: AliExpressRequestContext,
): unknown {
  const envelope = payload[
    envelopeKeyFor(operation) as keyof AliExpressTransportEnvelope
  ] as AliExpressOperationEnvelope | undefined;

  if (!envelope) {
    throw new AliExpressProviderError(
      `AliExpress ${operation} returned an unknown response envelope`,
      withRequestId(context, payload),
    );
  }

  const respResult = envelope.resp_result;
  if (!respResult) {
    throw new AliExpressProviderError(
      `AliExpress ${operation} returned a response without resp_result`,
      withRequestId(context, payload),
    );
  }

  if (!isRespSuccess(respResult.resp_code)) {
    throw new AliExpressProviderError(
      `AliExpress ${operation} failed: ${respResult.resp_msg ?? 'provider error'}`,
      withRequestId(context, payload),
    );
  }

  if (respResult.result === undefined || respResult.result === null) {
    throw new AliExpressProviderError(
      `AliExpress ${operation} returned a success response without result`,
      withRequestId(context, payload),
    );
  }

  return respResult.result;
}

/**
 * Verifies the SKU-detail nested envelope and returns the inner `result`.
 * Throws `AliExpressProviderError` when the documented nested structure is
 * missing or reports a failure.
 */
export function assertSkuDetailResult(
  payload: AliExpressTransportEnvelope,
  operation: string,
  context: AliExpressRequestContext,
): unknown {
  const envelope = payload[
    envelopeKeyFor(operation) as keyof AliExpressTransportEnvelope
  ] as AliExpressSkuDetailEnvelope | undefined;

  if (!envelope?.result) {
    throw new AliExpressProviderError(
      `AliExpress ${operation} returned an unknown response envelope`,
      withRequestId(context, payload),
    );
  }

  const inner = envelope.result;
  if (inner.result === undefined || inner.result === null) {
    throw new AliExpressProviderError(
      `AliExpress ${operation} failed: ${inner.code ?? 'missing result'}`,
      withRequestId(context, payload),
    );
  }

  return inner.result;
}

/**
 * Detects the documented `error_response` payload returned at the transport
 * boundary. Throws a normalized error without leaking the full payload.
 */
export function assertNoErrorResponse(
  payload: AliExpressTransportEnvelope,
  operation: string,
  context: AliExpressRequestContext,
): void {
  const errorResponse = payload.error_response as
    | AliExpressErrorResponse
    | undefined;
  if (!errorResponse) return;
  const detail =
    errorResponse.sub_msg ?? errorResponse.msg ?? 'provider transport error';
  throw new AliExpressProviderError(
    `AliExpress ${operation} rejected the request: ${detail}`,
    withRequestId(context, {
      request_id: errorResponse.request_id ?? payload.request_id,
    }),
  );
}

/**
 * Converts an Axios failure into a normalized provider error. Timeouts are
 * reported distinctly so the operation service can map them to a 503 response.
 */
export function normalizeTransportError(
  error: unknown,
  operation: string,
  context: AliExpressRequestContext,
): AliExpressProviderError {
  if (error instanceof AliExpressProviderError) return error;
  const axiosError = asAxiosError(error);
  if (axiosError) {
    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
      return new AliExpressProviderError(
        `AliExpress ${operation} timed out`,
        context,
        error,
      );
    }
    if (axiosError.response) {
      return new AliExpressProviderError(
        `AliExpress ${operation} responded with HTTP ${axiosError.response.status}`,
        context,
        error,
      );
    }
    return new AliExpressProviderError(
      `AliExpress ${operation} is unreachable`,
      context,
      error,
    );
  }
  return new AliExpressProviderError(
    `AliExpress ${operation} failed: ${unknownErrorMessage(error)}`,
    context,
    error,
  );
}

/**
 * Duck-typed AxiosError detector. Avoids `instanceof AxiosError` so the check
 * stays robust when callers (or tests) wrap axios in interceptors or mocks.
 */
function asAxiosError(error: unknown): Partial<AxiosError> | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const candidate = error as { isAxiosError?: unknown } & Partial<AxiosError>;
  if (candidate.isAxiosError !== true) return undefined;
  return candidate;
}

function isRespSuccess(respCode: string | number | undefined): boolean {
  if (respCode === undefined) return false;
  return String(respCode) === '200';
}

function withRequestId(
  context: AliExpressRequestContext,
  payload: { request_id?: string; _trace_id_?: string },
): AliExpressRequestContext {
  return {
    operation: context.operation,
    requestId: payload.request_id ?? context.requestId,
    traceId: payload._trace_id_ ?? context.traceId,
  };
}

function unknownErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'unexpected failure';
}
