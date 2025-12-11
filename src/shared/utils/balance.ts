import { APP_CURRENCY } from '@shared/constants';

export enum USER_WALLET {
  GENERAL = 'general',
  COMMISSION = 'commission',
}

export function getWalletNameFromCurrency(
  currency: APP_CURRENCY,
  wallet: USER_WALLET,
): string {
  return `${currency}_${wallet}`;
}

export function getCurrencyNameFromWallet(data: string): APP_CURRENCY {
  if (!data?.length) {
    return;
  }

  return data.split('_')[0] as APP_CURRENCY;
}

export function getWalletNameFromCurrencyName(currency: string): USER_WALLET {
  return currency.split('_')[1] as USER_WALLET;
}
