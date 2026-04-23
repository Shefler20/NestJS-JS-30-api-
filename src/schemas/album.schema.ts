import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Artist } from './artist.schema';

export type AlbumDocument = Album & Document;

@Schema()
export class Album {
  @Prop({
    type: Types.ObjectId,
    ref: Artist.name,
    required: true,
  })
  artist: Types.ObjectId | Artist;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, trim: true })
  date_at: number;
  @Prop({ default: null })
  image: string;
  @Prop({ default: false })
  isPublished: boolean;
}

export const AlbumSchema = SchemaFactory.createForClass(Album);
