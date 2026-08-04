import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { Trim } from 'src/common/decorators/trim.decorator';

import { EmployeeRoleLevel } from '../entities/role.entity';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Trim()
  title: string;

  @IsString()
  @IsEnum(EmployeeRoleLevel)
  level: EmployeeRoleLevel;
}
