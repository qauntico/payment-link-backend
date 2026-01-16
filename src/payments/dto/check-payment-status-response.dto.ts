import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CheckPaymentStatusResponseDto {
  @IsString()
  paymentId: string;

  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  externalReference?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  constructor(
    paymentId: string,
    status: string,
    externalReference?: string,
    receiptUrl?: string,
  ) {
    this.paymentId = paymentId;
    this.status = status;
    this.externalReference = externalReference;
    this.receiptUrl = receiptUrl;
  }
}
