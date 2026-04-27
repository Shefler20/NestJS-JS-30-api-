import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}
  async validateUser(username: string, password: string) {
    const user = await this.userModel.findOne({ username });

    if (user && (await user.checkPassword(password))) {
      user.generateAuthToken();
      await user.save();
      return user;
    }
    return null;
  }
}
