import { Body, Controller, Post, Req, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { RespondFriendDto } from './dto/respond-friend.dto';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private svc: FriendsService) {}

  @Post('request')
  create(@Req() req: any, @Body() dto: CreateFriendDto) {
    return this.svc.sendRequest(req.user.id, dto.receiverId);
  }

  @Post('respond')
  respond(@Body() dto: RespondFriendDto) {
    return this.svc.respondRequest(dto.friendId, dto.action);
  }

  @Get()
  list(@Req() req: any) {
    return this.svc.listFriends(req.user.id);
  }
}
