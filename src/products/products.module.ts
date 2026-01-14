import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Module({
  imports: [ConfigModule],
  providers: [ProductsService, CloudinaryService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
