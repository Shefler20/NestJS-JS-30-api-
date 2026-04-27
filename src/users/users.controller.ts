import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './create-user.dto';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}
  @Post()
  register(
    @Body() registerDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = new this.userModel({
      username: registerDto.username,
      password: registerDto.password,
      displayName: registerDto.displayName,
    });

    user.generateAuthToken();
    res.cookie('token', user.token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return user.save();
  }
  @UseGuards(AuthGuard('local'))
  @Post('sessions')
  login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as UserDocument;

    res.cookie('token', user.token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return user;
  }
}
