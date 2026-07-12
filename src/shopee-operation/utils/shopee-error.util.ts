import axios from 'axios';

interface ShopeeErrorResponseData {
  errors?: { message?: string }[];
  errMsg?: string;
  error_msg?: string;
  message?: string;
}

export function extractShopeeErrorMessage(error: unknown): string {
  // Axios errors (HTTP-level failures)
  if (axios.isAxiosError(error)) {
    const rawData: unknown = error.response?.data;

    // GraphQL-style error response: { errors: [{ message: '...' }] }
    if (rawData && typeof rawData === 'object') {
      const data = rawData as ShopeeErrorResponseData;

      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors
          .map((e) => e.message || JSON.stringify(e))
          .join('; ');
      }
      if (data.errMsg) return data.errMsg;
      if (data.error_msg) return data.error_msg;
      if (data.message) return data.message;
    }

    if (typeof rawData === 'string' && rawData.length > 0) {
      return rawData;
    }

    return error.message || `HTTP ${error.response?.status || 'unknown'}`;
  }

  // Regular Error instances (e.g. thrown inside processAffiliateLink)
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback for unknown types
  if (typeof error === 'string') {
    return error;
  }

  return 'Erro desconhecido';
}
