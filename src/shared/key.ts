import { APP_CURRENCY } from '@shared/constants';

export const gameListCacheKey = () => `game:list`;

export const partnerUsernameCacheKey = (username: string) =>
  `partner:username:${username}`;

export const analyticCacheKey = (hash: string) => `analytic:data:${hash}`;

export const lastLoginAtTimestampCacheKey = () =>
  `auth:last_login_at_timestamp`;

export const passCodeFailedAttemptsCacheKey = (email: string) =>
  `auth:pass_code_failed_attempts:${email}`;

export const stakeSummaryCacheKey = (walletAddress: string) =>
  `stake:summary:${walletAddress}`;

export const stakeWithdrawableCacheKey = (
  stakeId: string,
  walletAddress: string,
) => `stake:${stakeId}:withdrawable:${walletAddress}`;

export const userBalanceBreakdownCacheKey = (
  walletAddress: string,
  currency: APP_CURRENCY,
  destinationCurrency: APP_CURRENCY,
) =>
  `user:balance:breakdown:${walletAddress}:currency:${currency}:destinationCurrency:${destinationCurrency}`;

export const userBranchCacheKey = (userId: string) =>
  `user-branch:userId:${userId}`;

export const userTotalPrincipalClaimedCacheKey = (walletAddress: string) =>
  `user:total-principal-claimed:wallet:${walletAddress}`;

export const userStakeProfitCacheKey = (
  walletAddress: string,
  filterHash: string = '',
) => `user:stake-profit:${walletAddress}:filter:${filterHash}`;

export const userDailyCheckinCacheKey = (
  walletAddress: string,
  filterHash = '',
) => `user:daily-checkin:${walletAddress}:filter:${filterHash}`;

// Versioned cache keys
export const userTotalDepositCacheKey = (
  walletAddress: string,
  filterHash: string = '',
) =>
  `user:total-deposit:${walletAddress}:version:_version:filter:${filterHash}`;

export const userTotalWithdrawCacheKey = (
  walletAddress: string,
  filterHash: string = '',
) =>
  `user:total-withdraw:${walletAddress}:version:_version:filter:${filterHash}`;

export const userTotalStakedAmountCacheKey = (
  walletAddress: string,
  filterHash: string = '',
) =>
  `user:total-stake-amount:${walletAddress}:version:_version:filter:${filterHash}`;

export const userReferralPayoutBreakdownCacheKey = (walletAddress: string) =>
  `user:referral-payout-breakdown:${walletAddress}`;

export const userCardCommissionPayoutAmountCacheKey = (userId: string) =>
  `user:card-commission-payout-amount:${userId}`;

export const userLinkCacheKey = (filterHash: string) =>
  `user:link:${filterHash}`;

export const analyzeUserClaimedAmountCacheKey = (userId: string) =>
  `user:analyze-claimed-amount:userId:${userId}`;

export const getPartnerByNameCacheKey = (name: string) =>
  `partner:name:${name}`;
