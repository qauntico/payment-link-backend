import { Expose, Type } from "class-transformer";
import { IsString, IsNumber, IsDate, IsOptional, IsArray } from 'class-validator';


export class ProductDto {
    @Expose()
    @IsString()
    id: string;
  
    @Expose()
    @IsString()
    merchantId: string;
  
    @Expose()
    @IsString()
    image: string;
  
    @Expose()
    @IsString()
    title: string;
  
    @Expose()
    @IsOptional()
    @IsString()
    description: string | null;
  
    @Expose()
    @IsNumber()
    price: number;
  
    @Expose()
    @IsString()
    currency: string;
  
    @Expose()
    @IsOptional()
    @IsNumber()
    quantity: number | null;
  
    @Expose()
    @IsOptional()
    @IsString()
    email: string | null;
  
    @Expose()
    @IsOptional()
    @IsString()
    paymentLink: string | null;
  
    @Expose()
    isActive: boolean;
  
    @Expose()
    @IsDate()
    @Type(() => Date)
    createdAt: Date;
  
    @Expose()
    @IsDate()
    @Type(() => Date)
    updatedAt: Date;
  
  }
  