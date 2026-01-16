import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RestrictUserDto {
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsBoolean()
  @IsNotEmpty()
  restricted: boolean;
}
