import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Track, TrackDocument } from '../schemas/track.schema';
import { Model, Types } from 'mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { CreateTrackDto } from './create-track.dto';
import { TokenAuthGuard } from '../token-auth/token-auth.guard';

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Track.name)
    private readonly trackModel: Model<TrackDocument>,
    @InjectModel(Album.name)
    private albumModel: Model<AlbumDocument>,
  ) {}
  @Get()
  getAll(@Query('album') albumId: string) {
    if (albumId) {
      return this.trackModel
        .find({ album: new Types.ObjectId(albumId) })
        .populate('album');
    }
    return this.trackModel.find().populate('album');
  }
  @UseGuards(TokenAuthGuard)
  @Post()
  async create(@Body() albumDto: CreateTrackDto) {
    if (!Types.ObjectId.isValid(albumDto.album)) {
      throw new BadRequestException('Invalid album id');
    }
    const existingAlbum = await this.albumModel.findById(albumDto.album);
    if (!existingAlbum) {
      throw new NotFoundException('Album not found');
    }
    const newTrack = new this.trackModel({
      album: existingAlbum._id,
      name: albumDto.name,
      timeout: albumDto.timeout,
    });
    return newTrack.save();
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.trackModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Track not found');
    }

    return { message: 'Track deleted successfully.' };
  }
}
