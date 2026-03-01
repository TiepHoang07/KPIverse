import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { FriendsService } from './friends.service.js';
import { CreateFriendDto } from './dto/create-friend.dto.js';
import { RespondFriendDto } from './dto/respond-friend.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private svc: FriendsService) {}

  @Post('request')
  create(@Req() req: any, @Body() dto: CreateFriendDto) {
    return this.svc.sendRequest(req.user.id, dto.receiverId);
  }

  @Post('respond')
  respond(@Req() req: any, @Body() dto: RespondFriendDto) {
    return this.svc.respondRequest(dto.friendId, req.user.id, dto.action);
  }

  @Get()
  list(@Req() req: any) {
    return this.svc.listFriends(req.user.id);
  }

  @Get('pending')
  getPendingRequests(@Req() req: any) {
    return this.svc.getPendingRequests(req.user.id);
  }

  @Get('sent')
  getSentRequests(@Req() req: any) {
    return this.svc.getSentRequests(req.user.id);
  }

  @Delete('cancel/:friendId')
  cancelRequest(
    @Req() req: any,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    return this.svc.cancelRequest(friendId, req.user.id);
  }

  @Delete(':friendId')
  removeFriend(
    @Req() req: any,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    return this.svc.removeFriend(req.user.id, friendId);
  }
}