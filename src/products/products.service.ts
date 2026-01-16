import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductWithPaymentsDto } from './dto/product-with-payments.dto';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { generatePaymentLink } from './utils/slug.util';
import { prisma } from 'src/prisma.service';
import { Currency } from '../generated/prisma/enums';

@Injectable()
export class ProductsService {
  constructor(
    private cloudinaryService: CloudinaryService,
  ) {}

  async createProduct(
    merchantId: string,
    createProductDto: CreateProductDto,
    imageFile: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    console.log('createProductDto', createProductDto, imageFile, merchantId);
    const { title, description, price, quantity, email, currency } = createProductDto;

    // Validate image file
    if (!imageFile) {
      throw new BadRequestException('Product image is required');
    }

    // Validate image file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(imageFile.mimetype)) {
      throw new BadRequestException(
        'Invalid image type. Only JPEG, PNG, and WebP are allowed.',
      );
    }

    try {
      // Upload image to Cloudinary
      const imageUrl = await this.cloudinaryService.uploadImage(imageFile);
    //   console.log('imageUrl', imageUrl);

      // Create product first to get the ID
      const product = await prisma.product.create({
        data: {
          merchantId,
          image: imageUrl,
          title,
          description: description || null,
          price: price.toString(), // Convert to string for Decimal type
          currency: (currency as Currency) || Currency.XAF, // Default to XAF if not provided
          quantity: quantity !== undefined ? quantity : null, // null = unlimited
          email: email || null,
          paymentLink: null, // Will be updated after creation
          isActive: true,
        },
      });

      // Generate payment link with product ID
      const paymentLink = generatePaymentLink(product.id);

      // Update product with the payment link
      const updatedProduct = await prisma.product.update({
        where: { id: product.id },
        data: { paymentLink },
      });

      // Transform response
      const response: ProductResponseDto = {
        id: updatedProduct.id,
        merchantId: updatedProduct.merchantId,
        image: updatedProduct.image,
        title: updatedProduct.title,
        description: updatedProduct.description,
        price: Number(updatedProduct.price),
        currency: updatedProduct.currency,
        quantity: updatedProduct.quantity,
        email: updatedProduct.email,
        paymentLink: updatedProduct.paymentLink,
        isActive: updatedProduct.isActive,
        createdAt: updatedProduct.createdAt,
        updatedAt: updatedProduct.updatedAt,
      };

      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Log the full error for debugging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new InternalServerErrorException(
        `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async updateProduct(
    productId: string,
    merchantId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    // Find the product first
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if the merchant owns this product
    if (product.merchantId !== merchantId) {
      throw new ForbiddenException('You do not have permission to update this product');
    }

    try {
      // Prepare update data (only include fields that are provided)
      const updateData: any = {};

      if (updateProductDto.title !== undefined) {
        updateData.title = updateProductDto.title;
      }

      if (updateProductDto.description !== undefined) {
        updateData.description = updateProductDto.description || null;
      }

      if (updateProductDto.price !== undefined) {
        updateData.price = updateProductDto.price.toString();
      }

      if (updateProductDto.currency !== undefined) {
        updateData.currency = updateProductDto.currency as Currency;
      }

      if (updateProductDto.quantity !== undefined) {
        updateData.quantity = updateProductDto.quantity !== null ? updateProductDto.quantity : null;
      }

      if (updateProductDto.email !== undefined) {
        updateData.email = updateProductDto.email || null;
      }

      if (updateProductDto.isActive !== undefined) {
        updateData.isActive = updateProductDto.isActive;
      }

      // Update the product
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: updateData,
      });

      // Transform response
      const response: ProductResponseDto = {
        id: updatedProduct.id,
        merchantId: updatedProduct.merchantId,
        image: updatedProduct.image,
        title: updatedProduct.title,
        description: updatedProduct.description,
        price: Number(updatedProduct.price),
        currency: updatedProduct.currency,
        quantity: updatedProduct.quantity,
        email: updatedProduct.email,
        paymentLink: updatedProduct.paymentLink,
        isActive: updatedProduct.isActive,
        createdAt: updatedProduct.createdAt,
        updatedAt: updatedProduct.updatedAt,
      };

      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  

  async toggleProductStatus(
    productId: string,
    merchantId: string,
    isActive: boolean,
  ): Promise<ProductResponseDto> {
    try {
      // Find product first
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Check if the merchant owns this product
      if (product.merchantId !== merchantId) {
        throw new ForbiddenException(
          'You do not have permission to update this product',
        );
      }

      // Update the isActive status
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { isActive },
      });

      // Transform response
      const response: ProductResponseDto = {
        id: updatedProduct.id,
        merchantId: updatedProduct.merchantId,
        image: updatedProduct.image,
        title: updatedProduct.title,
        description: updatedProduct.description,
        price: Number(updatedProduct.price),
        currency: updatedProduct.currency,
        quantity: updatedProduct.quantity,
        email: updatedProduct.email,
        paymentLink: updatedProduct.paymentLink,
        isActive: updatedProduct.isActive,
        createdAt: updatedProduct.createdAt,
        updatedAt: updatedProduct.updatedAt,
      };

      return response;
    } catch (error) {
      console.error('Error toggling product status:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update product status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async deleteProduct(productId: string, merchantId: string): Promise<void> {
    // Find the product first
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if the merchant owns this product
    if (product.merchantId !== merchantId) {
      throw new ForbiddenException('You do not have permission to delete this product');
    }

    try {
      // Delete the product (cascade will handle related payments/receipts if configured)
      await prisma.product.delete({
        where: { id: productId },
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getProductWithPayments(
    productId: string,
    merchantId: string,
  ): Promise<ProductWithPaymentsDto> {
    try {
      // Find product with payments and receipts
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          payments: {
            include: {
              receipt: true, 
            },
            orderBy: {
              createdAt: 'desc', // Most recent payments first
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Check if the merchant owns this product
      if (product.merchantId !== merchantId) {
        throw new ForbiddenException(
          'You do not have permission to view this product',
        );
      }

      // Transform response
      const response: ProductWithPaymentsDto = {
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
        payments: product.payments.map((payment) => ({
          id: payment.id,
          productId: payment.productId,
          customerName: payment.customerName,
          customerEmail: payment.customerEmail,
          customerPhoneNumber: payment.customerPhoneNumber,
          amount: payment.amount ? Number(payment.amount) : null,
          status: payment.status,
          externalReference: payment.externalReference,
          momoReference: payment.momoReference,
          currencyCode: payment.currencyCode,
          countryCode: payment.countryCode,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          receipt: payment.receipt
            ? {
                id: payment.receipt.id,
                paymentId: payment.receipt.paymentId,
                receiptUrl: payment.receipt.receiptUrl,
                createdAt: payment.receipt.createdAt,
              }
            : null,
        })),
      };

      return response;
    } catch (error) {
      console.error('Error fetching product with payments:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getAllProductsByMerchant(
    merchantId: string,
    search?: string,
  ): Promise<ProductResponseDto[]> {
    try {
      // Build where clause
      const where: any = { merchantId };

      // Add search filter if provided
      if (search && search.trim()) {
        where.title = {
          contains: search.trim(),
          mode: 'insensitive', // Case-insensitive search
        };
      }

      // Find all products for the merchant (with optional search)
      const products = await prisma.product.findMany({
        where,
        orderBy: {
          createdAt: 'desc', // Most recent products first
        },
      });

      // Transform response
      const response: ProductResponseDto[] = products.map((product) => ({
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
      }));

      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new InternalServerErrorException(
        `Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
