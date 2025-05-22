import { notifyToast } from "../notification/notification";


export interface BackendError {
  antaresErrorMessage?: string;
  date?: string;
  type?: string;
}

export const handleBackendErrorToast = (errorText: string): string => {
  let parsedError: unknown;
  let errorMessage = errorText;

  try {
    parsedError = JSON.parse(errorText);
    if (typeof parsedError === 'object' && parsedError !== null) {
      const be = parsedError as Partial<BackendError>;
      errorMessage = be.antaresErrorMessage ?? errorText;
    }
  } catch {
    // Ignore parsing failure
  }

  notifyToast({
    type: 'error',
    message: errorMessage,
  });

  return errorMessage;
};