/**
 * Stable public response envelope shared by all AliExpress operations.
 *
 * The envelope exposes `{ success, data }` on success and
 * `{ success: false, error, message }` on expected operation failures. Original
 * AliExpress `snake_case` field names live untouched inside `data`; the
 * operation service is the boundary that decides which failures become
 * NestJS exceptions (transport/validation/malformed) versus in-envelope errors.
 */
export interface AliExpressOperationResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class AliExpressOperationResponseDto<T = unknown>
  implements AliExpressOperationResponse<T>
{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;

  private constructor(
    success: boolean,
    data?: T,
    error?: string,
    message?: string,
  ) {
    this.success = success;
    if (data !== undefined) this.data = data;
    if (error !== undefined) this.error = error;
    if (message !== undefined) this.message = message;
  }

  static success<T>(data: T): AliExpressOperationResponseDto<T> {
    return new AliExpressOperationResponseDto<T>(true, data);
  }

  static error<T = unknown>(
    error: string,
    message?: string,
  ): AliExpressOperationResponseDto<T> {
    return new AliExpressOperationResponseDto<T>(
      false,
      undefined,
      error,
      message,
    );
  }
}
