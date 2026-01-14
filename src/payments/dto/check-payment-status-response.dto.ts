import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CheckPaymentStatusResponseDto {
  @IsNumber()
  paymentId: number;

  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  externalReference?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  constructor(
    paymentId: number,
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
