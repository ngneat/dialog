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
