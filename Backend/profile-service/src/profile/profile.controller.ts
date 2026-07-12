import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('profiles/:userId')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getProfile(@Param('userId') userId: string, @Request() req) {
    return this.profileService.getProfile(userId, req.user ?? null);
  }

  @Put('profiles/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  updateProfile(
    @Param('userId') userId: string,
    @Body() dto: UpdateProfileDto,
    @Request() req,
  ) {
    return this.profileService.updateProfile(userId, req.user.userId, dto);
  }

  @Post('profiles/:userId/photo')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  uploadPhoto(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.profileService.updatePhoto(userId, req.user.userId, file.filename);
  }
}
