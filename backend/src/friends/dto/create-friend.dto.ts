import { IsInt } from 'class-validator';

export class CreateFriendDto {
  @IsInt()
  receiverId: number;
}
