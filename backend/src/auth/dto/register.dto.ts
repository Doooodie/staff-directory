import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
} from 'class-validator';

import { UserRoleLevel } from '../entities/user.entity.js';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword({ minLength: 8, minNumbers: 1 })
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsEnum(UserRoleLevel)
  role?: UserRoleLevel;
}
