import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1 })
  @IsNotEmpty()
  password: string;
}
