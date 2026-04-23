import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { Model } from 'mongoose';
import { CreateArtistDto } from './create-artist.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<ArtistDocument>,
  ) {}
  @Get()
  async getAll() {
    return this.artistModel.find();
  }
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.artistModel.findById(id);
  }
  @Post()
  @UseInterceptors(
    FileInterceptor('image', { dest: './public/uploads/artist' }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() artistDto: CreateArtistDto,
  ) {
    const newArtist = new this.artistModel({
      name: artistDto.name,
      description: artistDto.description?.trim() || null,
      image: file ? '/uploads/artist/' + file.filename : null,
    });
    return newArtist.save();
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.artistModel.findByIdAndDelete(id);
  }
}
