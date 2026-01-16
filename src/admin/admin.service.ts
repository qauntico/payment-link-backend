import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from 'src/prisma.service';
import { DashboardStatsDto, StatItemDto } from './dto/dashboard-stats.dto';
import { RestrictUserDto } from './dto/restrict-user.dto';
import { ChangeProductStatusDto } from './dto/change-product-status.dto';
import { UsersListResponseDto } from './dto/users-list-response.dto';
import { ProductsListResponseDto } from './dto/products-list-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserDataDto } from '../users/dto/user-data.dto';
import { ProductResponseDto } from '../products/dto/product-response.dto';
import { ProductWithPaymentsDto } from '../products/dto/product-with-payments.dto';
import {
  normalizePaginationParams,
  getSkipValue,
  calculatePagination,
} from '../utils/pagination.util';

@Injectable()
export class AdminService {
  /**
   * Calculate percentage change between current and previous values
   */
  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) {
      // If previous is 0, return 100% if current > 0, else 0%
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  }

  /**
   * Get start and end dates for current month
   */
  private getCurrentMonthDates(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  /**
   * Get start and end dates for previous month
   */
  private getPreviousMonthDates(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start, end };
  }

  /**
   * Get dashboard statistics with month-over-month comparisons
   */
  async getDashboardStats(): Promise<DashboardStatsDto> {
    try {
      const currentMonth = this.getCurrentMonthDates();
      const previousMonth = this.getPreviousMonthDates();

      // console.log('currentMonth', currentMonth);
      // console.log('previousMonth', previousMonth);

      // Get current month period string
      const period = new Date().toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      //console.log('period', period);

      // 1. Total Users (cumulative up to end of each month)
      const totalUsersCurrent = await prisma.user.count({
        where: {
          createdAt: {
            lte: currentMonth.end,
          },
        },
      });

      const totalUsersPrevious = await prisma.user.count({
        where: {
          createdAt: {
            lte: previousMonth.end,
          },
        },
      });

      // 2. Total Payments (all payments created this month)
      const totalPaymentsCurrent = await prisma.payment.count({
        where: {
          createdAt: {
            gte: currentMonth.start,
            lte: currentMonth.end,
          },
        },
      });

      const totalPaymentsPrevious = await prisma.payment.count({
        where: {
          createdAt: {
            gte: previousMonth.start,
            lte: previousMonth.end,
          },
        },
      });

      // 3. Total Receipts (all receipts created this month)
      const totalReceiptsCurrent = await prisma.receipt.count({
        where: {
          createdAt: {
            gte: currentMonth.start,
            lte: currentMonth.end,
          },
        },
      });

      const totalReceiptsPrevious = await prisma.receipt.count({
        where: {
          createdAt: {
            gte: previousMonth.start,
            lte: previousMonth.end,
          },
        },
      });

      // 4. Payments with status "initiated" (created this month)
      const initiatedPaymentsCurrent = await prisma.payment.count({
        where: {
          status: 'initiated',
          createdAt: {
            gte: currentMonth.start,
            lte: currentMonth.end,
          },
        },
      });

      const initiatedPaymentsPrevious = await prisma.payment.count({
        where: {
          status: 'initiated',
          createdAt: {
            gte: previousMonth.start,
            lte: previousMonth.end,
          },
        },
      });

      // Build response
      const response: DashboardStatsDto = {
        period,
        totalUsers: {
          current: totalUsersCurrent,
          previous: totalUsersPrevious,
          percentageChange: this.calculatePercentageChange(
            totalUsersCurrent,
            totalUsersPrevious,
          ),
        },
        totalPayments: {
          current: totalPaymentsCurrent,
          previous: totalPaymentsPrevious,
          percentageChange: this.calculatePercentageChange(
            totalPaymentsCurrent,
            totalPaymentsPrevious,
          ),
        },
        totalReceipts: {
          current: totalReceiptsCurrent,
          previous: totalReceiptsPrevious,
          percentageChange: this.calculatePercentageChange(
            totalReceiptsCurrent,
            totalReceiptsPrevious,
          ),
        },
        initiatedPayments: {
          current: initiatedPaymentsCurrent,
          previous: initiatedPaymentsPrevious,
          percentageChange: this.calculatePercentageChange(
            initiatedPaymentsCurrent,
            initiatedPaymentsPrevious,
          ),
        },
      };

      return response;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new InternalServerErrorException(
        `Failed to fetch dashboard statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Restrict or unrestrict a user
   */
  async restrictUser(restrictUserDto: RestrictUserDto): Promise<{ message: string; userId: string; restricted: boolean }> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: restrictUserDto.userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${restrictUserDto.userId} not found`);
      }

      // Prevent restricting/unrestricting admins
      if (user.role === 'ADMIN') {
        throw new BadRequestException('Cannot restrict or unrestrict admin users');
      }

      // Update user's restricted status
      const updatedUser = await prisma.user.update({
        where: { id: restrictUserDto.userId },
        data: { restricted: restrictUserDto.restricted },
      });

      return {
        message: updatedUser.restricted
          ? 'User has been restricted successfully'
          : 'User has been unrestricted successfully',
        userId: updatedUser.id,
        restricted: updatedUser.restricted,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error restricting/unrestricting user:', error);
      throw new InternalServerErrorException(
        `Failed to ${restrictUserDto.restricted ? 'restrict' : 'unrestrict'} user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Change product isActive status (Admin only)
   */
  async changeProductStatus(productId: string, changeProductStatusDto: ChangeProductStatusDto): Promise<{ message: string; productId: string }> {
    try {
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      // Update the product's isActive status
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: changeProductStatusDto.isActive },
      });

      return {
        message: `Product ${productId} has been ${changeProductStatusDto.isActive ? 'activated' : 'deactivated'} successfully`,
        productId: productId,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error changing product status:', error);
      throw new InternalServerErrorException(
        `Failed to change product status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get all users with pagination (Admin only)
   */
  async getAllUsers(paginationQuery: PaginationQueryDto): Promise<UsersListResponseDto> {
    try {
      // Normalize pagination parameters
      const { page, limit } = normalizePaginationParams(
        paginationQuery.page,
        paginationQuery.limit,
      );

      // Build search filter if search term is provided
      const searchFilter = paginationQuery.search
        ? {
            OR: [
              { id: { contains: paginationQuery.search, mode: 'insensitive' as const } },
              { firstName: { contains: paginationQuery.search, mode: 'insensitive' as const } },
              { lastName: { contains: paginationQuery.search, mode: 'insensitive' as const } },
              { businessName: { contains: paginationQuery.search, mode: 'insensitive' as const } },
              { email: { contains: paginationQuery.search, mode: 'insensitive' as const } },
            ],
          }
        : undefined;

      // Get total count of users (with search filter if provided)
      const total = await prisma.user.count({
        where: searchFilter,
      });

      // Get users with pagination and search filter
      const users = await prisma.user.findMany({
        where: searchFilter,
        skip: getSkipValue(page, limit),
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          businessName: true,
          supportEmail: true,
          restricted: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Transform users to UserDataDto format
      const usersData: UserDataDto[] = users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        businessName: user.businessName,
        supportEmail: user.supportEmail,
        restricted: user.restricted,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      // Calculate pagination metadata
      const pagination = calculatePagination(total, page, limit);

      return {
        users: usersData,
        pagination,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new InternalServerErrorException(
        `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get all products with pagination (Admin only)
   */
  async getAllProducts(paginationQuery: PaginationQueryDto): Promise<ProductsListResponseDto> {
    try {
      // Normalize pagination parameters
      const { page, limit } = normalizePaginationParams(
        paginationQuery.page,
        paginationQuery.limit,
      );

      // Build search filter if search term is provided
      const searchFilter = paginationQuery.search
        ? {
            OR: [
              { id: { contains: paginationQuery.search, mode: 'insensitive' as const } },
              { title: { contains: paginationQuery.search, mode: 'insensitive' as const } },
            ],
          }
        : undefined;

      // Get total count of products (with search filter if provided)
      const total = await prisma.product.count({
        where: searchFilter,
      });

      // Get products with pagination and search filter
      const products = await prisma.product.findMany({
        where: searchFilter,
        skip: getSkipValue(page, limit),
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform products to ProductResponseDto format
      const productsData: ProductResponseDto[] = products.map((product) => ({
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

      // Calculate pagination metadata
      const pagination = calculatePagination(total, page, limit);

      return {
        products: productsData,
        pagination,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new InternalServerErrorException(
        `Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get product with all transactions (payments) and receipts (Admin only)
   */
  async getProductWithTransactions(productId: string): Promise<ProductWithPaymentsDto> {
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
        throw new NotFoundException(`Product with ID ${productId} not found`);
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching product with transactions:', error);
      throw new InternalServerErrorException(
        `Failed to fetch product with transactions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
