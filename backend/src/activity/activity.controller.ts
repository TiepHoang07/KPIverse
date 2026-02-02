import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';

@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get('feed')
  getFeed(@Req() req: any) {
    return this.activityService.getFeed(req.user.id);
  }

  @Post(':id/like')
  like(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.activityService.like(id, req.user.id);
  }
}
