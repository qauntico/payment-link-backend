import { Expose, Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { UserDataDto } from './user-data.dto';

export class LoginResponseDto {
  @Expose()
  @Type(() => UserDataDto)
  user: UserDataDto;

  @Expose()
  @IsString()
  accessToken: string;
}
