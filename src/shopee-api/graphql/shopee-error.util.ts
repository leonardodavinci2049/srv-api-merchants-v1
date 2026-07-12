import axios from 'axios';

interface ShopeeErrorResponseData {
  errors?: Array<{ message?: string }>;
  errMsg?: string;
  error_msg?: string;
  message?: string;
}

export function extractShopeeErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const rawData = error.response?.data;
    if (rawData && typeof rawData === 'object') {
      const data = rawData as ShopeeErrorResponseData;
      if (data.errors?.length) {
        return data.errors
          .map((item) => item.message || JSON.stringify(item))
          .join('; ');
      }
      if (data.errMsg) return data.errMsg;
      if (data.error_msg) return data.error_msg;
      if (data.message) return data.message;
    }
    if (typeof rawData === 'string' && rawData) return rawData;
    return error.message || `HTTP ${error.response?.status || 'desconhecido'}`;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Erro desconhecido';
}
