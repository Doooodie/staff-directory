import { Transform } from 'class-transformer';

import type { TransformFnParams } from 'class-transformer';

/**
 * Trims a string value.
 */
export const Trim = () =>
  Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : '',
  );
