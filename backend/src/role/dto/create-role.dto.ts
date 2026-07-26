import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { RoleLevel } from '../entities/role.entity';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsEnum(RoleLevel)
  level: RoleLevel;
}
