import { TransformFnParams } from 'class-transformer';

export const transformToDate = ({ value }: TransformFnParams): Date | any => {
  if (value === null || value === undefined) return value;

  const num = Number(value);

  if (isNaN(num)) return value;

  if (num < 10000000000) {
    return new Date(num * 1000);
  }

  return new Date(num);
};
