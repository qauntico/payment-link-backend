import { Expose, Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsOptional, IsBoolean } from 'class-validator';
import { ProductDto } from './product.dto';
import { UserDataDto } from '../../users/dto/user-data.dto';

export class ProductWithMerchantDto {
  @Expose()
  @Type(() => ProductDto)
  product: ProductDto;

  @Expose()
  @Type(() => UserDataDto)
  merchant: UserDataDto;
}
