import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true })
  displayName: string;
  @Prop({ required: true, default: 'user', enum: ['admin', 'user'] })
  role: string;
  @Prop()
  token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (this: UserDocument) {
  if (!this.isModified('password')) return;

  try {
    this.password = await argon2.hash(this.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
    });
  } catch (e) {
    console.error(e);
    throw new Error('Error hashing password');
  }
});

UserSchema.methods.checkPassword = function (
  this: UserDocument,
  password: string,
): Promise<boolean> {
  return argon2.verify(this.password, password);
};

UserSchema.methods.generateAuthToken = function (this: UserDocument) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  this.token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { username, token, role, displayName } = ret;
    return { username, token, role, displayName };
  },
});
