export class MerchantStatsResponseDto {
  total_completed_transactions: number;
  amount_earn: string;

  constructor(total_completed_transactions: number, amount_earn: string) {
    this.total_completed_transactions = total_completed_transactions;
    this.amount_earn = amount_earn;
  }
}
