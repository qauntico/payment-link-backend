import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsEmail,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName?: string;

  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName?: string;

  @IsString({ message: 'Phone number must be a string' })
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Please provide a valid phone number',
  })
  phoneNumber?: string;

  @IsString({ message: 'Business name must be a string' })
  @IsOptional()
  @MinLength(2, { message: 'Business name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Business name must not exceed 100 characters' })
  businessName?: string;

  @IsEmail({}, { message: 'Please provide a valid support email address' })
  @IsOptional()
  supportEmail?: string | null;
}
