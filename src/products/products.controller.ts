import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
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
import { ProductResponseDto } from './dto/product-response.dto';
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

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateProduct(
    @Request() req,
    @Param('id', ParseIntPipe) productId: number,
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(
    @Request() req,
    @Param('id', ParseIntPipe) productId: number,
  ): Promise<void> {
    // req.user is set by AuthGuard (contains: sub, email, role)
    const merchantId = req.user.sub;
    await this.productsService.deleteProduct(productId, merchantId);
  }
}
