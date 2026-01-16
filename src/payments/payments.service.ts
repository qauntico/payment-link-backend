import {
  Injectable,
  InternalServerErrorException,
  BadGatewayException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticatePaymentResponseDto } from './dto/authenticate-payment-response.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { InitiatePaymentResponseDto } from './dto/initiate-payment-response.dto';
import { CheckPaymentStatusResponseDto } from './dto/check-payment-status-response.dto';
import { ProductWithMerchantDto } from './dto/product-with-merchant.dto';
import { prisma } from 'src/prisma.service';
import { randomUUID } from 'crypto';
import { CloudinaryService } from '../products/cloudinary/cloudinary.service';
import { generateReceiptPdf } from './utils/receipt.util';
import { paymentApiPost, paymentApiGet } from './utils/payment-api.util';
import { sendReceiptEmail } from './utils/send-receipt-email.util';

interface PaymentAuthResponse {
  message: string;
  data: {
    accessToken: string;
    expiresIn: number;
  };
}

interface PaymentInitiateResponse {
  message: string;
  data: {
    providerChannel: string;
    paymentProvider: string;
    providerStatus: string;
    internalPaymentId: string;
    providerMessage: string;
  };
}

interface PaymentStatusResponse {
  message: string;
  data: {
    status: string;
    fees: string;
    feePolicy: string;
    feeValue: string;
    amount: string;
    rawAmount: string;
    validatedAt: string;
    providerCurrency: string;
    transactionCurrency: string;
    providerAmount: string;
    specialOfferAmount: number;
    baseCurrencyPaidAmount: string;
    internalReference: string;
    operatorReference: string;
    providerReference: string;
    externalTransactionReference: string;
  };
}

@Injectable()
export class PaymentsService {
  constructor(
    private configService: ConfigService,
    private cloudinaryService: CloudinaryService,
  ) {}
  // Authenticate payment for a product
  async authenticatePayment(
    productId: string,
  ): Promise<AuthenticatePaymentResponseDto> {
    const baseUrl = this.configService.get<string>('PAYMENTBASE_URL');
    const clientKey = this.configService.get<string>('PAYMENT_CLIENT_KEY');
    const clientSecret = this.configService.get<string>(
      'PAYMENT_CLIENT_SECRET',
    );

    if (!baseUrl || !clientKey || !clientSecret) {
      throw new InternalServerErrorException(
        'Payment API configuration is missing',
      );
    }

    try {
      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (
        (product.quantity !== null && product.quantity === 0) ||
        product.isActive === false
      ) {
        throw new NotFoundException(
          'Either the quantity is 0 or the product is not active',
        );
      }

      // Make POST request to payment authentication endpoint
      const data: PaymentAuthResponse = await paymentApiPost<{
        accessToken: string;
        expiresIn: number;
      }>('/api/v1/xyz/authenticate', {
        baseUrl,
        clientKey,
        clientSecret,
      }).catch((error) => {
        if (error.status === 401) {
          throw new UnauthorizedException(
            'Payment API authentication failed: Invalid credentials',
          );
        }
        throw new BadGatewayException(
          `Payment API authentication failed: ${error.message || error.statusText}`,
        );
      });

      if (!data.data?.accessToken) {
        throw new BadGatewayException(
          'Invalid response from payment API: missing accessToken',
        );
      }

      // Create payment entry with just the token
      const payment = await prisma.payment.create({
        data: {
          token: data.data.accessToken,
          status: 'not_initialized',
          productId: productId,
        },
      });

      return new AuthenticatePaymentResponseDto(
        payment.id,
        'Payment authentication successful',
      );
    } catch (error) {
      console.error('Error authenticating payment:', error);
      if (
        error instanceof BadGatewayException ||
        error instanceof UnauthorizedException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to authenticate payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Initiate payment for a product
  async initiatePayment(
    initiatePaymentDto: InitiatePaymentDto,
  ): Promise<InitiatePaymentResponseDto> {
    const {
      paymentId,
      paymentMode,
      phoneNumber,
      quantity,
      fullName,
      emailAddress,
      currencyCode,
      countryCode,
    } = initiatePaymentDto;

    const baseUrl = this.configService.get<string>('PAYMENTBASE_URL');
    const clientKey = this.configService.get<string>('PAYMENT_CLIENT_KEY');
    const clientSecret = this.configService.get<string>(
      'PAYMENT_CLIENT_SECRET',
    );

    if (!baseUrl || !clientKey || !clientSecret) {
      throw new InternalServerErrorException(
        'Payment API configuration is missing',
      );
    }

    try {
      // Find the payment by paymentId
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status === 'confirmed') {
        throw new BadGatewayException('Payment has already been completed');
      }

      const product = await prisma.product.findUnique({
        where: { id: payment.productId || undefined },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (
        (product.quantity !== null && product.quantity === 0) ||
        product.isActive === false
      ) {
        throw new NotFoundException('Product quantity is 0 or product is not active');
      }


      if (!payment.token) {
        throw new UnauthorizedException(
          'Payment token not found. Please authenticate payment first.',
        );
      }

      let amount = 0;
      if (quantity > (product.quantity || 0)) {
        throw new BadGatewayException('Quantity is greater than product quantity');
      }
      amount = Number(product.price) * Number(quantity);
      console.log('amount', amount);
      // Generate unique UUID for externalReference
      const externalReference = randomUUID();

      // Update payment with customer and payment details
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          customerName: fullName,
          customerEmail: emailAddress,
          customerPhoneNumber: phoneNumber,
          amount: amount.toString(), // Convert to string for Decimal type
          currencyCode: currencyCode,
          countryCode: countryCode,
          quantity: quantity,
          externalReference: externalReference,
        },
      });

      // Make POST request to payment initiation endpoint
      const data: PaymentInitiateResponse = await paymentApiPost<{
        providerChannel: string;
        paymentProvider: string;
        providerStatus: string;
        internalPaymentId: string;
        providerMessage: string;
      }>(
        '/api/v1/xyz/initiate',
        {
          baseUrl,
          clientKey,
          clientSecret,
          token: payment.token,
        },
        {
          paymentMode: paymentMode,
          phoneNumber: phoneNumber,
          transactionType: "payin",
          amount: amount,
          fullName: fullName,
          emailAddress: emailAddress,
          currencyCode: currencyCode,
          countryCode: countryCode,
          externalReference: externalReference,
        },
      ).catch((error) => {
        // Check if token has expired (401 Unauthorized)
        if (error.status === 401) {
          throw new UnauthorizedException(
            'Payment token has expired. Please authenticate payment again.',
          );
        }
        throw new BadGatewayException(
          `Payment initiation failed: ${error.message || error.statusText}`,
        );
      });

      if (!data.data?.providerStatus) {
        throw new BadGatewayException(
          'Invalid response from payment API: missing providerStatus',
        );
      }

      // Update payment status with providerStatus
      const finalPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: data.data.providerStatus,
          momoReference: data.data.internalPaymentId, // Store internal payment ID
        },
      });

      return new InitiatePaymentResponseDto(
        finalPayment.id,
        'Payment initialized successfully',
        data.data.providerStatus,
        data.data.internalPaymentId,
      );
    } catch (error) {
      console.error('Error initiating payment:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof BadGatewayException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to initiate payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async checkPaymentStatus(
    paymentId: string,
  ): Promise<CheckPaymentStatusResponseDto> {
    const baseUrl = this.configService.get<string>('PAYMENTBASE_URL');
    const clientKey = this.configService.get<string>('PAYMENT_CLIENT_KEY');
    const clientSecret = this.configService.get<string>(
      'PAYMENT_CLIENT_SECRET',
    );

    if (!baseUrl || !clientKey || !clientSecret) {
      throw new InternalServerErrorException(
        'Payment API configuration is missing',
      );
    }

    try {
      // Find the payment by paymentId with product and merchant relations
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          product: {
            include: {
              merchant: true,
            },
          },
        },
      });

      if (!payment) {
        throw new NotFoundException('Payment record not found');
      }

      // Check if payment status is "initiated"
      if (payment.status !== 'initiated') {
        throw new BadGatewayException(
          'Payment has not been initiated. Please initiate payment first. or the payment has already been completed',
        );
      }

      if (!payment.externalReference) {
        throw new BadGatewayException(
          'Payment external reference not found. Payment may not be properly initialized.',
        );
      }

      if (!payment.token) {
        throw new UnauthorizedException(
          'Payment token not found. Please authenticate payment again.',
        );
      }

      // Make GET request to check payment status
      const data: PaymentStatusResponse = await paymentApiGet<{
        status: string;
        fees: string;
        feePolicy: string;
        feeValue: string;
        amount: string;
        rawAmount: string;
        validatedAt: string;
        providerCurrency: string;
        transactionCurrency: string;
        providerAmount: string;
        specialOfferAmount: number;
        baseCurrencyPaidAmount: string;
        internalReference: string;
        operatorReference: string;
        providerReference: string;
        externalTransactionReference: string;
      }>(`/api/v1/xyz/check-status?reference=${payment.externalReference}`, {
        baseUrl,
        clientKey,
        clientSecret,
        token: payment.token,
      }).catch((error) => {
        // Check if token has expired (401 Unauthorized)
        if (error.status === 401) {
          throw new UnauthorizedException(
            'Payment token has expired. Please authenticate payment again.',
          );
        }
        throw new BadGatewayException(
          `Payment status check failed: ${error.message || error.statusText}`,
        );
      });

      //console.log("data", data)

      if (!data.data?.status) {
        throw new BadGatewayException(
          'Invalid response from payment API: missing status',
        );
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: data.data.status,
        },
        include: {
          product: {
            include: {
              merchant: true,
            },
          },
        },
      });

      // If status is "confirmed", reduce product quantity and generate receipt
      if (data.data.status === 'confirmed') {
        try {
          // console.log('updatedPayment', updatedPayment);
          // Reduce product quantity if product exists and quantity is not null
          if (updatedPayment.productId && updatedPayment.product) {
            const product = updatedPayment.product;

            // Only update if quantity is not null (some products have unlimited quantity)
            if (product.quantity !== null && product.quantity > 0) {
              const newQuantity = product.quantity - (updatedPayment.quantity || 0);

              await prisma.product.update({
                where: { id: updatedPayment.productId },
                data: {
                  quantity: newQuantity,
                  // Optionally set isActive to false when quantity reaches 0
                  isActive: newQuantity > 0,
                },
              });
            }
          }

          // Generate PDF receipt
          const pdfBuffer = await generateReceiptPdf({
            payment: updatedPayment,
          });

          // Upload to Cloudinary
          const receiptUrl = await this.cloudinaryService.uploadPdf(
            pdfBuffer,
            `receipt-${paymentId}-${Date.now()}`,
          );

          // Create or update receipt record
          await prisma.receipt.upsert({
            where: { paymentId: paymentId },
            update: {
              receiptUrl: receiptUrl,
            },
            create: {
              paymentId: paymentId,
              receiptUrl: receiptUrl,
            },
          });

          // Send receipt email to customer if email is available
          if (updatedPayment.customerEmail && updatedPayment.customerName) {
            try {
              await sendReceiptEmail({
                customerEmail: updatedPayment.customerEmail,
                customerName: updatedPayment.customerName,
                productTitle: updatedPayment.product?.title || 'Product',
                amount: updatedPayment.amount
                  ? Number(updatedPayment.amount).toFixed(2)
                  : '0.00',
                currency: updatedPayment.currencyCode || updatedPayment.product?.currency || 'XAF',
                receiptUrl: receiptUrl,
                merchantName: updatedPayment.product?.merchant?.businessName || 'Merchant',
              });
            } catch (emailError) {
              // Log error but don't fail the payment process
              console.error('Failed to send receipt email:', emailError);
            }
          }

          return new CheckPaymentStatusResponseDto(
            paymentId,
            data.data.status,
            payment.externalReference,
            receiptUrl,
          );
        } catch (receiptError) {
          console.error('Error generating receipt:', receiptError);
          // Continue even if receipt generation fails
          // Return status without receipt URL
          return new CheckPaymentStatusResponseDto(
            paymentId,
            data.data.status,
            payment.externalReference,
          );
        }
      }

      // If status is not "confirmed", return status, paymentId, and externalReference
      return new CheckPaymentStatusResponseDto(
        paymentId,
        data.data.status,
        payment.externalReference,
      );
    } catch (error) {
      console.error('Error checking payment status:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof BadGatewayException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to check payment status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getProductWithMerchant(
    productId: string,
  ): Promise<ProductWithMerchantDto> {
    try {
      // Find product with merchant information
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          merchant: true,
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      // Transform product data
      const productData = {
        id: product.id,
        merchantId: product.merchantId,
        image: product.image,
        title: product.title,
        description: product.description,
        price: Number(product.price),
        currency: product.currency,
        quantity: product.quantity,
        email: product.email,
        paymentLink: product.paymentLink,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

      // Transform merchant data
      const merchantData = {
        id: product.merchant.id,
        email: product.merchant.email,
        firstName: product.merchant.firstName,
        lastName: product.merchant.lastName,
        phoneNumber: product.merchant.phoneNumber,
        businessName: product.merchant.businessName,
        supportEmail: product.merchant.supportEmail,
        role: product.merchant.role,
        createdAt: product.merchant.createdAt,
        updatedAt: product.merchant.updatedAt,
      };

      return {
        product: productData,
        merchant: merchantData,
      };
    } catch (error) {
      console.error('Error fetching product with merchant:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
