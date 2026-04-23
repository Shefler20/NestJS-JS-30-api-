import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

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
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, file, cb) => {
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
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() artistDto: CreateArtistDto,
  ) {
    let folder = 'other';

    if (file?.mimetype?.includes('jpeg')) folder = 'jpg';
    if (file?.mimetype?.includes('png')) folder = 'png';
    const newArtist = new this.artistModel({
      name: artistDto.name,
      description: artistDto.description?.trim() || null,
      image: file ? `/uploads/${folder}/${file.filename}` : null,
    });
    return newArtist.save();
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.artistModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Track not found');
    }

    return { message: 'Artist deleted successfully.' };
  }
}
