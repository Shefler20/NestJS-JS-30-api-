import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Album } from './album.schema';

export type TrackDocument = Track & Document;

@Schema()
export class Track {
  @Prop({
    type: Types.ObjectId,
    ref: Album.name,
    required: true,
  })
  album: Types.ObjectId | Album;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, trim: true })
  timeout: string;
  @Prop()
  track_count: number;
  @Prop({ default: false })
  isPublished: boolean;
}

export const TrackSchema = SchemaFactory.createForClass(Track);

TrackSchema.pre('save', async function (this: TrackDocument) {
  if (this.isNew && this.track_count === undefined) {
    const count = await this.model('Track').countDocuments({
      album: this.album,
    });
    this.track_count = count + 1;
  }
});
