import { IsEnum, IsInt } from "class-validator";
import { FriendStatus } from "generated/prisma/enums";

export class RespondFriendDto {
  @IsInt()
  friendId: number

  @IsEnum(FriendStatus)
  action: FriendStatus;
}