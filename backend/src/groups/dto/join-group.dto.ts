import { IsInt } from "class-validator";

export class JoinGroupDto {
  @IsInt() groupId: number;
}