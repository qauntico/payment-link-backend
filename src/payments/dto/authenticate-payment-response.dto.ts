import { IsString } from 'class-validator';

export class AuthenticatePaymentResponseDto {
  @IsString()
  id: string;

  @IsString()
  message: string;

  constructor(id: string, message: string = 'Payment authentication successful') {
    this.id = id;
    this.message = message;
  }
}
