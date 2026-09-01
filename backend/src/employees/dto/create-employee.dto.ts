import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  Validate,
} from 'class-validator';

import { Trim } from '../../common/decorators/trim.decorator';
import { IsNotFutureDateStringConstraint } from '../../common/validators/is-not-future-date-string';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Trim()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Trim()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsDateString({ strict: true })
  @Validate(IsNotFutureDateStringConstraint)
  hireDate: string;

  @Type(() => Number)
  @IsNumber()
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
