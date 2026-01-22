import { IsInt, Min } from 'class-validator';

export class LogKpiDto {
  @IsInt()
  @Min(1)
  value: number;
}
