import { IsArray, IsBoolean } from 'class-validator';

export class LogKpiDto {
  @IsArray()
  taskIds: number[];

  @IsBoolean()
  completed: boolean;
}
