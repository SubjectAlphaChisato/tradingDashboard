export interface TimeframeData {
  pm_purchased?: number;
  pm_purchase_times?: number;
  pm_sell_times?: number;
  pm_sold?: number;
  eth_purchased?: number;
  eth_sold?: number;
  buy_amount?: number;
  sell_amount?: number;
  profit_trades?: number;
  loss_trades?: number;
  total_profit?: number;
  pm_hold?: number;
  eth_hold?: number;
  unrealized_profit?: number;
}

export interface TransactionSummary {
  "1hour": TimeframeData;
  "1day": TimeframeData;
  "7days": TimeframeData;
  "total": TimeframeData;
}

export type TabKey = "1hour" | "1day" | "7days" | "total";

