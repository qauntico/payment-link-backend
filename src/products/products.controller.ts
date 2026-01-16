import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ToggleProductStatusDto } from './dto/toggle-product-status.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductWithPaymentsDto } from './dto/product-with-payments.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/role.decorator';
import { Role } from '../roles/roles.enum';

@Controller('products')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Merchant, Role.Admin)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async createProduct(
    @Request() req,
    @Body() createProductDto: CreateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB max
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    imageFile: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    // req.user is set by AuthGuard (contains: sub, email, role)
    const merchantId = req.user.sub;
    return this.productsService.createProduct(
      merchantId,
      createProductDto,
      imageFile,
    );
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async toggleProductStatus(
    @Request() req,
    @Param('id') productId: string,
    @Body() toggleStatusDto: ToggleProductStatusDto,
  ): Promise<ProductResponseDto> {
    // req.user is set by AuthGuard (contains: sub, email, role)
    const merchantId = req.user.sub;
    return this.productsService.toggleProductStatus(
      productId,
      merchantId,
      toggleStatusDto.isActive,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateProduct(
    @Request() req,
    @Param('id') productId: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    // req.user is set by AuthGuard (contains: sub, email, role)
    const merchantId = req.user.sub;
    return this.productsService.updateProduct(
      productId,
      merchantId,
      updateProductDto,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllProducts(
    @Request() req,
    @Query('search') search?: string,
  ): Promise<ProductResponseDto[]> {
    // req.user is set by AuthGuard (contains: sub, email, role)
    const merchantId = req.user.sub;
    return this.productsService.getAllProductsByMerchant(merchantId, search);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getProductWithPayments(
    @Request() req,
    @Param('id') productId: string,
  ): Promise<ProductWithPaymentsDto> {
    // req.user is set by AuthGuard (contains: sub, email, role)
    const merchantId = req.user.sub;
    return this.productsService.getProductWithPayments(productId, merchantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(
    @Request() req,
    @Param('id') productId: string,
  ): Promise<void> {
    // req.user is set by AuthGuard (contains: sub, email, role)
    const merchantId = req.user.sub;
    await this.productsService.deleteProduct(productId, merchantId);
  }
}
