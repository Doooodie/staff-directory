import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { Trim } from '../../common/decorators/trim.decorator.js';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Trim()
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
