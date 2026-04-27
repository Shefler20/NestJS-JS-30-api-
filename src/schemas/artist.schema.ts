import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export type ArtistDocument = Artist & Document;

@Schema()
export class Artist {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: Types.ObjectId | User;
  @Prop({ required: true, unique: true, trim: true })
  name: string;
  @Prop({ default: null })
  image: string;
  @Prop({ default: null })
  description: string;
  @Prop({ default: false })
  isPublished: boolean;
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);
