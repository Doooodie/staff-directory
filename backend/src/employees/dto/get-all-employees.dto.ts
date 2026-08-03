import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
} from 'class-validator';

export class GetAllEmployeesQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @Transform(({ value }: { value?: string }) => {
    const loweredValue = value?.toLowerCase();

    if (loweredValue === 'true') return true;
    if (loweredValue === 'false') return false;

    return loweredValue;
  })
  @IsBoolean()
  isActive?: boolean;
}
