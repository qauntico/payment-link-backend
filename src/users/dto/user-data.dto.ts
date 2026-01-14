import { Expose, Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsOptional } from 'class-validator';

export class UserDataDto {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsString()
  email: string;

  @Expose()
  @IsString()
  firstName: string;

  @Expose()
  @IsString()
  lastName: string;

  @Expose()
  @IsString()
  phoneNumber: string;

  @Expose()
  @IsString()
  businessName: string;

  @Expose()
  @IsOptional()
  @IsString()
  supportEmail: string | null;

  @Expose()
  @IsString()
  role: string;

  @Expose()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
