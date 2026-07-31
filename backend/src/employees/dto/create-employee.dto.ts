import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  Validate,
} from 'class-validator';

import { IsNotFutureDateStringConstraint } from 'src/common/validators/is-not-future-date-string';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : '',
  )
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : '',
  )
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsDateString({ strict: true })
  @Validate(IsNotFutureDateStringConstraint)
  hireDate: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(0.01)
  @Max(999999.99)
  salary: number;

  @IsUUID()
  @IsNotEmpty()
  departmentId: string;

  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
