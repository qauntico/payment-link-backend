import { IsString, IsNumber } from 'class-validator';

export class InitiatePaymentResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  message: string;

  @IsString()
  providerStatus?: string;

  @IsString()
  internalPaymentId?: string;

  constructor(
    id: number,
    message: string = 'Payment initialized successfully',
    providerStatus?: string,
    internalPaymentId?: string,
  ) {
    this.id = id;
    this.message = message;
    this.providerStatus = providerStatus;
    this.internalPaymentId = internalPaymentId;
  }
}
