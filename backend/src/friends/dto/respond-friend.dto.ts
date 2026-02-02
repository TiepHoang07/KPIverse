import { IsIn, IsInt } from 'class-validator';

export class RespondFriendDto {
  @IsInt()
  friendId: number;

  @IsIn(['ACCEPTED', 'BLOCKED'])
  action: any;
}
