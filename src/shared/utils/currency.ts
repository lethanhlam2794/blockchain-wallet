import { APP_CURRENCY } from '@shared/constants';
import { ExchangeRateConfig } from '@shared/interfaces';

export function isUSDCurrency(currency: string): boolean {
  return [APP_CURRENCY.USDT, APP_CURRENCY.USDC].includes(
    currency.toLowerCase().trim() as APP_CURRENCY,
  );
}

export function getExchangeRateByCurrency(
  exchangeRateConfig: ExchangeRateConfig,
  currency: APP_CURRENCY,
): number {
  switch (currency) {
    case APP_CURRENCY.EUR:
      return exchangeRateConfig.eurToEurvRate;

    case APP_CURRENCY.USDC:
    case APP_CURRENCY.USDT:
      return exchangeRateConfig.usdToEurvRate;

    default:
      throw new Error(`unsupported currency: ${currency}`);
  }
}
