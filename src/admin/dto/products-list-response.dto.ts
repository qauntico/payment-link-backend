import { ProductResponseDto } from '../../products/dto/product-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination-response.dto';

export class ProductsListResponseDto {
  products: ProductResponseDto[];
  pagination: PaginationResponseDto;
}
