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
  @IsNumber()
  @IsNotEmpty()
  paymentId: number;

  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsEnum(PaymentMode)
  @IsNotEmpty()
  paymentMode: PaymentMode;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  transactionType: string; // "payin"

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount: number;

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
