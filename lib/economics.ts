export interface EconomicsInput {
  daily: number;
  days: number;
  errorRate: number;
  errorCost: number;
  reduction: number;
  apiCost: number;
  subscription: number;
  included: number;
  overage: number;
  successFee: number;
  feeCap: number;
  support: number;
  cac: number;
  churn: number;
}
export const baseEconomics: EconomicsInput = {
  daily: 200,
  days: 30,
  errorRate: 5,
  errorCost: 2000,
  reduction: 60,
  apiCost: 8,
  subscription: 45000,
  included: 5000,
  overage: 10,
  successFee: 10,
  feeCap: 100000,
  support: 10000,
  cac: 150000,
  churn: 3,
};
export const presets = {
  cautious: {
    ...baseEconomics,
    daily: 150,
    errorRate: 4,
    errorCost: 1800,
    reduction: 50,
  },
  base: baseEconomics,
  optimistic: {
    ...baseEconomics,
    daily: 300,
    errorRate: 6,
    errorCost: 2200,
    reduction: 70,
  },
};
export function calculateEconomics(i: EconomicsInput) {
  const orders = i.daily * i.days,
    loss = ((orders * i.errorRate) / 100) * i.errorCost,
    recovered = (loss * i.reduction) / 100;
  const extra = Math.max(0, orders - i.included) * i.overage,
    fee = Math.min((recovered * i.successFee) / 100, i.feeCap);
  const payment = i.subscription + extra + fee,
    cost = orders * i.apiCost + i.support,
    profit = payment - cost;
  return {
    orders,
    loss,
    recovered,
    extra,
    fee,
    payment,
    cost,
    profit,
    net: recovered - payment,
    roi: payment > 0 ? recovered / payment : 0,
    margin: payment > 0 ? (profit / payment) * 100 : 0,
    payback: profit > 0 ? i.cac / profit : null,
    ltv: profit > 0 && i.churn > 0 ? profit / (i.churn / 100) : null,
  };
}
