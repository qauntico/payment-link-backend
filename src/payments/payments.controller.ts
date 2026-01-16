import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthenticatePaymentResponseDto } from './dto/authenticate-payment-response.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { InitiatePaymentResponseDto } from './dto/initiate-payment-response.dto';
import { CheckPaymentStatusResponseDto } from './dto/check-payment-status-response.dto';
import { ProductWithMerchantDto } from './dto/product-with-merchant.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('authenticate/:productId')
  @HttpCode(HttpStatus.OK)
  async authenticatePayment(
    @Param('productId') productId: string,
  ): Promise<AuthenticatePaymentResponseDto> {
    return this.paymentsService.authenticatePayment(productId);
  }

  @Post('initiate')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async initiatePayment(
    @Body() initiatePaymentDto: InitiatePaymentDto,
  ): Promise<InitiatePaymentResponseDto> {
    return this.paymentsService.initiatePayment(initiatePaymentDto);
  }

  @Get('status/:paymentId')
  @HttpCode(HttpStatus.OK)
  async checkPaymentStatus(
    @Param('paymentId') paymentId: string,
  ): Promise<CheckPaymentStatusResponseDto> {
    return this.paymentsService.checkPaymentStatus(paymentId);
  }

  @Get('product/:productId')
  @HttpCode(HttpStatus.OK)
  async getProductWithMerchant(
    @Param('productId') productId: string,
  ): Promise<ProductWithMerchantDto> {
    return this.paymentsService.getProductWithMerchant(productId);
  }
  

  

}
