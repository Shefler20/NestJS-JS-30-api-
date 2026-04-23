import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { CreateAlbumDto } from './create-album.dto';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name)
    private albumModel: Model<AlbumDocument>,
    @InjectModel(Artist.name)
    private artistModel: Model<ArtistDocument>,
  ) {}
  @Get()
  getAll(@Query('artist') artistId?: string) {
    if (artistId) {
      return this.albumModel
        .find({ artist: new Types.ObjectId(artistId) })
        .populate('artist');
    }
    return this.albumModel.find().populate('artist');
  }
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          let folder = 'other';

          if (file.mimetype === 'image/jpeg') folder = 'jpg';
          if (file.mimetype === 'image/png') folder = 'png';

          const uploadPath = join(process.cwd(), 'public/uploads', folder);
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (_req, file, callback) => {
          const extension = path.extname(file.originalname);
          callback(null, randomUUID() + extension);
        },
      }),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistDto: CreateAlbumDto,
  ) {
    const artistExisting = await this.artistModel.findById(artistDto.artist);
    if (!artistExisting) {
      throw new NotFoundException('Artist not found');
    }
    let folder = 'other';

    if (file?.mimetype?.includes('jpeg')) folder = 'jpg';
    if (file?.mimetype?.includes('png')) folder = 'png';
    const newAlbum = new this.albumModel({
      artist: artistExisting._id,
      name: artistDto.name,
      date_at: Number(artistDto.date_at),
      image: file ? `/uploads/${folder}/${file.filename}` : null,
    });
    return newAlbum.save();
  }
  @Get(':id')
  getAlbum(@Param('id') id: string) {
    return this.albumModel.findById(id).populate('artist');
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.albumModel.findByIdAndDelete(id);
    return 'ok';
  }
}
