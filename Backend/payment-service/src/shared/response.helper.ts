export function success(message: string, extra: Record<string, any> = {}) {
  return { status: 'SUCCESS', message, ...extra };
}

export function error(errorCode: string, message: string) {
  return { status: 'ERROR', errorCode, message };
}
