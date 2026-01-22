import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { KPIType, KPIScope } from '@prisma/client';

export class CreateKpiDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(KPIType)
  type: KPIType;

  @IsEnum(KPIScope)
  scope: KPIScope;

  @IsInt()
  @Min(1)
  target: number;
}
