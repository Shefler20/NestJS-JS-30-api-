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
  Req,
  UploadedFile,
  UseGuards,
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
import { RequestWithUser } from '../common/types/request-with-user';
import { TokenAuthGuard } from '../token-auth/token-auth.guard';
import { RoleAuthGuard } from '../role-auth/role-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

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
  @UseGuards(TokenAuthGuard)
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
    @Body() albumDto: CreateAlbumDto,
  ) {
    if (!Types.ObjectId.isValid(albumDto.artist)) {
      throw new BadRequestException('Invalid artist id');
    }
    const artistExisting = await this.artistModel.findById(albumDto.artist);
    if (!artistExisting) {
      throw new NotFoundException('Artist not found');
    }
    let folder = 'other';

    if (file?.mimetype?.includes('jpeg')) folder = 'jpg';
    if (file?.mimetype?.includes('png')) folder = 'png';
    const newAlbum = new this.albumModel({
      artist: artistExisting._id,
      name: albumDto.name,
      date_at: Number(albumDto.date_at),
      image: file ? `/uploads/${folder}/${file.filename}` : null,
    });
    return newAlbum.save();
  }
  @Get(':id')
  getAlbum(@Param('id') id: string) {
    return this.albumModel.findById(id).populate('artist');
  }
  @UseGuards(TokenAuthGuard, RoleAuthGuard)
  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.albumModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Album not found');
    }

    return { message: 'Album deleted successfully.' };
  }
}
