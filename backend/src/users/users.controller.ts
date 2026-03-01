import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UsersService } from './users.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { multerOptions } from '../common/middleware/upload.middleware.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: any) {
    return this.usersService.getMe(req.user.id);
  }

  @Patch('profile')
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Patch('password')
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(
      req.user.id,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  @Patch('avatar')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const url = `src/uploads/${file.filename}`;
    return this.usersService.updateAvatar(req.user.id, url);
  }

  @Get('search')
  async searchUsers(@Query('q') query: string, @Req() req: any) {
    return this.usersService.searchUsers(query, req.user.id);
  }
}
