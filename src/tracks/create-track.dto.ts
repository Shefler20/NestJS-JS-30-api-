import { IsMongoId, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTrackDto {
  @IsMongoId({ message: 'Некорректный ID альбома' })
  album: string;

  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString({ message: 'Название трека должно быть строкой' })
  @Length(1, 100, { message: 'Название должно быть от 1 до 100 символов' })
  name: string;

  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString({ message: 'Длительность должна быть строкой' })
  @Matches(/^\d{1,2}:\d{2}$/, {
    message: 'Формат должен быть mm:ss (например 03:45)',
  })
  timeout: string;
}
