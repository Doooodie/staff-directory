import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNotFutureDateString', async: false })
export class IsNotFutureDateStringConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    return (
      typeof value === 'string' &&
      value <= new Date().toISOString().slice(0, 10)
    );
  }

  defaultMessage() {
    return 'hireDate must not be in the future';
  }
}
