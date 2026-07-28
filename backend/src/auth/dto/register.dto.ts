import { IsEmail, IsEnum, IsNotEmpty, IsStrongPassword } from 'class-validator';

import { UserRoleLevel } from '../entities/user.entity';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1 })
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRoleLevel)
  role: UserRoleLevel;
}
