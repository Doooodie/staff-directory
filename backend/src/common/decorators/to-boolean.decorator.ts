import { Transform } from 'class-transformer';

/**
 * Converts a string value to a boolean.
 */
export const ToBoolean = () =>
  Transform(({ value }: { value?: string }) => {
    const loweredValue = value?.toLowerCase();

    if (loweredValue === 'true') return true;
    if (loweredValue === 'false') return false;

    return loweredValue;
  });
