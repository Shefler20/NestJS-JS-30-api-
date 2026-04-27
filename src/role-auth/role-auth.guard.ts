import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { RequestWithUser } from '../common/types/request-with-user';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) return false;

    return roles.includes(user.role);
  }
}
