import { IsNumber, IsString } from 'class-validator';

export class AuthenticatePaymentResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  message: string;

  constructor(id: number, message: string = 'Payment authentication successful') {
    this.id = id;
    this.message = message;
  }
}
