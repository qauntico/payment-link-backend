import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class StatItemDto {
  @Expose()
  @IsNumber()
  current: number;

  @Expose()
  @IsNumber()
  previous: number;

  @Expose()
  @IsNumber()
  percentageChange: number; // Can be positive (increase) or negative (decrease)
}

export class DashboardStatsDto {
  @Expose()
  @IsString()
  period: string; // e.g., "January 2024"

  @Expose()
  totalUsers: StatItemDto;

  @Expose()
  totalPayments: StatItemDto;

  @Expose()
  totalReceipts: StatItemDto;

  @Expose()
  initiatedPayments: StatItemDto;
}
