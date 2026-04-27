import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateAlbumDto {
  @IsMongoId({ message: 'Некорректный ID артиста' })
  artist: string;

  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString({ message: 'Название должно быть строкой' })
  @Length(1, 100, { message: 'Название должно быть от 1 до 100 символов' })
  name: string;

  @Type(() => Number)
  @IsInt({ message: 'Дата должна быть числом' })
  @Min(1900, { message: 'Слишком старая дата' })
  date_at: number;

  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  image?: string;
}
