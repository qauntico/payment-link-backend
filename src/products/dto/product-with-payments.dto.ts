import { Expose, Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsOptional, IsArray } from 'class-validator';

class ReceiptDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  paymentId: string;

  @Expose()
  @IsOptional()
  @IsString()
  receiptUrl: string | null;

  @Expose()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;
}

class PaymentDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsOptional()
  @IsString()
  productId: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  customerName: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  customerEmail: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  customerPhoneNumber: string | null;

  @Expose()
  @IsOptional()
  @IsNumber()
  amount: number | null;

  @Expose()
  @IsOptional()
  @IsString()
  status: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  externalReference: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  momoReference: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  currencyCode: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  countryCode: string | null;

  @Expose()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  @IsOptional()
  @Type(() => ReceiptDto)
  receipt: ReceiptDto | null;
}

export class ProductWithPaymentsDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  merchantId: string;

  @Expose()
  @IsString()
  image: string;

  @Expose()
  @IsString()
  title: string;

  @Expose()
  @IsOptional()
  @IsString()
  description: string | null;

  @Expose()
  @IsNumber()
  price: number;

  @Expose()
  @IsString()
  currency: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  quantity: number | null;

  @Expose()
  @IsOptional()
  @IsString()
  email: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  paymentLink: string | null;

  @Expose()
  isActive: boolean;

  @Expose()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  @IsArray()
  @Type(() => PaymentDto)
  payments: PaymentDto[];
}
