import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { RestrictUserDto } from './dto/restrict-user.dto';
import { ChangeProductStatusDto } from './dto/change-product-status.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UsersListResponseDto } from './dto/users-list-response.dto';
import { ProductsListResponseDto } from './dto/products-list-response.dto';
import { ProductWithPaymentsDto } from '../products/dto/product-with-payments.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/role.decorator';
import { Role } from '../roles/roles.enum';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @HttpCode(HttpStatus.OK)
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getAllUsers(@Query() paginationQuery: PaginationQueryDto): Promise<UsersListResponseDto> {
    return this.adminService.getAllUsers(paginationQuery);
  }

  @Get('products')
  @HttpCode(HttpStatus.OK)
  async getAllProducts(@Query() paginationQuery: PaginationQueryDto): Promise<ProductsListResponseDto> {
    return this.adminService.getAllProducts(paginationQuery);
  }

  @Get('products/:productId/transactions')
  @HttpCode(HttpStatus.OK)
  async getProductWithTransactions(
    @Param('productId') productId: string,
  ): Promise<ProductWithPaymentsDto> {
    return this.adminService.getProductWithTransactions(productId);
  }

  @Patch('users/restrict')
  @HttpCode(HttpStatus.OK)
  async restrictUser(@Body() restrictUserDto: RestrictUserDto) {
    return this.adminService.restrictUser(restrictUserDto);
  }

  @Patch('products/:productId/status')
  @HttpCode(HttpStatus.OK)
  async changeProductStatus(
    @Param('productId') productId: string,
    @Body() changeProductStatusDto: ChangeProductStatusDto,
  ) {
    return this.adminService.changeProductStatus(productId, changeProductStatusDto);
  }
}
