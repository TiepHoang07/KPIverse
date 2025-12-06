import { IsEnum, IsIn, IsInt } from 'class-validator';
import { FriendStatus } from 'generated/prisma/enums';

export class RespondFriendDto {
  @IsInt()
  friendId: number;

  // @IsEnum(FriendStatus)
  // action: FriendStatus;
  // @IsIn(Object.values(FriendStatus))
  // action: FriendStatus;
  @IsIn(['ACCEPTED', 'BLOCKED'])
  action: any;
}
