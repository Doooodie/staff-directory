import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { EmployeeRoleLevel } from '../entities/role.entity';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsEnum(EmployeeRoleLevel)
  level: EmployeeRoleLevel;
}
