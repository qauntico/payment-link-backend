import { Expose, Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { UserDataDto } from './user-data.dto';

export class SignupResponseDto {
  @Expose()
  @Type(() => UserDataDto)
  user: UserDataDto;

  @Expose()
  @IsString()
  accessToken: string;
}
