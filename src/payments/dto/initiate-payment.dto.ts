import {
  IsString,
  IsNumber,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Min,
} from 'class-validator';

export enum PaymentMode {
  MOMO = 'MOMO',
  OM = 'OM',
}

export class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsEnum(PaymentMode)
  @IsNotEmpty()
  paymentMode: PaymentMode;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  emailAddress: string;

  @IsString()
  @IsNotEmpty()
  currencyCode: string;

  @IsString()
  @IsNotEmpty()
  countryCode: string;
}
