import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @Expose()
  id: string;

  @Expose()
  merchantId: string;

  @Expose()
  image: string;

  @Expose()
  title: string;

  @Expose()
  description: string | null;

  @Expose()
  price: number;

  @Expose()
  currency: string;

  @Expose()
  quantity: number | null;

  @Expose()
  email: string | null;

  @Expose()
  paymentLink: string | null;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
