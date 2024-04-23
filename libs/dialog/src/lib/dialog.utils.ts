function isNil(value: unknown): value is undefined | null {
  return value === undefined || value === null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function coerceCssPixelValue(value: any): string {
  if (isNil(value)) {
    return '';
  }

  return isString(value) ? value : `${value}px`;
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
