import { IsIn, IsArray, IsOptional, IsString } from 'class-validator';

export type KPIType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type KPIScope = 'PERSONAL' | 'GROUP';

export class CreateKpiDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['DAILY', 'WEEKLY', 'MONTHLY'])
  type: KPIType;

  @IsIn(['PERSONAL', 'GROUP'])
  scope: KPIScope;

  @IsArray()
  tasks: {
    name: string;
  }[];
}
