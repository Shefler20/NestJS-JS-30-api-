import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import jwt from 'jsonwebtoken';
import { RequestWithUser } from '../common/types/request-with-user';

type TokenPayload = {
  _id: string;
};

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const token = request.cookies?.token;
    if (!token) return false;

    const secret = process.env.JWT_SECRET;
    if (!secret) return false;

    let decoded: TokenPayload;

    try {
      decoded = jwt.verify(token, secret) as TokenPayload;
    } catch {
      return false;
    }

    const user = await this.userModel.findOne({
      _id: decoded._id,
      token,
    });

    if (!user) return false;

    request.user = user;

    return true;
  }
}
