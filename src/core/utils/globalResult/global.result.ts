import { ResultModel } from 'src/core/utils/result.model';
import { MESSAGES, RESPONSE_CODES } from '../constants/globalConstants';

export function resultQueryData<T>(
  recordId: number,
  errorId: number,
  feedback: string,
  resultData: T,
  quantity: number = 0,
  info1?: string,
): ResultModel {
  const sanitizedData = JSON.parse(JSON.stringify(resultData)) as T;
  //console.log('resultQueryDataxxxxxxx');

  if (errorId === 0 && recordId > 0) {
    const sucessoMessage =
      feedback && feedback.trim() !== ''
        ? feedback
        : MESSAGES.PROCESSING_SUCCESS;
    return new ResultModel(
      RESPONSE_CODES.SUCCESS,
      sucessoMessage,
      recordId,
      sanitizedData, // Sanitize the data
      quantity,
      info1,
    );
  } else {
    const failedMessage =
      feedback && feedback.trim() !== ''
        ? feedback
        : MESSAGES.PROCESSING_FAILURE;

    return new ResultModel(
      RESPONSE_CODES.PROCESSING_FAILED,
      failedMessage,
      recordId, // Sanitize the data
      sanitizedData,
      quantity,
    );
  }
}
