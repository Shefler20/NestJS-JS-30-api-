import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class CreateUserDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @Length(3, 20, {
    message: 'Имя пользователя должно быть от 3 до 20 символов',
  })
  username: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(3, 50, {
    message: 'Пароль должен быть от 6 до 50 символов',
  })
  password: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Отображаемое имя должно быть строкой' })
  @Length(2, 30, {
    message: 'Имя должно быть от 2 до 30 символов',
  })
  displayName: string;
}
