import { Request } from 'express';
import { HydratedDocument } from 'mongoose';
import { User } from '../../schemas/user.schema';

export interface RequestWithUser extends Request {
  user: HydratedDocument<User>;
  cookies: Record<string, string>;
}
