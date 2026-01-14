import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsEmail,
  IsInt,
  Min as MinNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class UpdateProductDto {
  @IsString({ message: 'Title must be a string' })
  @IsOptional()
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a number with max 2 decimal places' },
  )
  @Min(0.01, { message: 'Price must be greater than 0' })
  @IsOptional()
  price?: number;

  @IsEnum(['XAF', 'USD'], { message: 'Currency must be either XAF or USD' })
  @IsOptional()
  currency?: 'XAF' | 'USD';

  @IsInt({ message: 'Quantity must be an integer' })
  @MinNumber(0, { message: 'Quantity must be 0 or greater' })
  @IsOptional()
  quantity?: number; // null = unlimited, otherwise fixed quantity

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string; // Optional email for product-specific contact

  @IsBoolean({ message: 'isActive must be a boolean' })
  @IsOptional()
  isActive?: boolean;
}
