import { IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateArtistDto {
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString({ message: 'Имя должно быть строкой' })
  @Length(2, 50, { message: 'Имя должно быть от 2 до 50 символов' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @Length(0, 500, { message: 'Описание слишком длинное' })
  description?: string;
}
