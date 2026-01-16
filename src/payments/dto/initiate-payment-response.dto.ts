import { IsString } from 'class-validator';

export class InitiatePaymentResponseDto {
  @IsString()
  id: string;

  @IsString()
  message: string;

  @IsString()
  providerStatus?: string;

  @IsString()
  internalPaymentId?: string;

  constructor(
    id: string,
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
