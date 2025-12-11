import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function AllowOnlyCharacters({
  pattern,
  options,
  useCustomValidate,
}: {
  pattern?: RegExp;
  options?: ValidationOptions;
  useCustomValidate?: (value: string) => boolean;
}) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'AllowOnlyCharacters',
      target: object.constructor,
      propertyName,
      options,
      constraints: [pattern],
      validator: {
        validate(value: any, args: ValidationArguments): boolean {
          if (typeof value !== 'string') return false;

          const constraint = args.constraints[0];

          if (constraint instanceof RegExp) {
            return constraint.test(value);
          }

          if (useCustomValidate) {
            return useCustomValidate(value);
          }

          return true;
        },
        defaultMessage(): string {
          return 'Invalid value';
        },
      },
    });
  };
}
