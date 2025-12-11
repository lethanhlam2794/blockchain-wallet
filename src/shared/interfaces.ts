import { Request } from 'express';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  QueryRunner,
} from 'typeorm';

import {
  APP_CURRENCY,
  COMMISSION_TYPE,
  FEE_UNIT,
  KYC_IMAGE_TYPE,
} from './constants';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  code?: string;
}

export interface PaginationResult<T = any> {
  rows: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface AppRequest extends Request {
  id: string;
  user: any;
  partner: any;
  startTime: Date;
  refCode?: string;
}

export interface ContractCallData {
  functionName: string;
}

export interface RunnerUser {
  alias: string;
  runner: QueryRunner;
}

export interface ViewBalanceOption {
  forceReload: boolean;
}

export interface FindOptions {
  select?: FindOptionsSelect<any>;
  relations?: FindOptionsRelations<any>;
  order?: FindOptionsOrder<any>;
  withDeleted?: boolean;
}

export interface UserAuthProfile {
  id: string;
  email: string;
  username: string;
  userWalletAddress: string;
  settings: Record<string, any>;
}

export interface UserAuthSocialProfile {
  provider: string;
  providerUserId: string;
  email: string;
  accessToken?: string;
  refreshToken?: string;
  referrerCode?: string;
}

export interface HasTimestamp {
  createdAt: Date;
  updatedAt: Date;
}

export interface UserKycImageType {
  url: string;
  type: KYC_IMAGE_TYPE;
}

export interface ERC20TransferData extends ContractCallData {
  destinationAddress: string;
  amount: string;
  currency: APP_CURRENCY | string;
}

export interface PaginationResult<T = any> {
  rows: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface DepositConfig {
  currency: APP_CURRENCY;
  depositEnabled: boolean;
}

export interface BankDepositConfig {
  bankBeneficiaryName: string;
  bankName: string;
  bankNumber: string;
  bankIBAN: string;
  bankSWIFTCode: string;
  bankCountryCode: string;
  bankReferenceCode: string;
  qrURL: string;
  minDepositAmount: number;
  maxDepositAmount: number;
}

export interface ExchangeRateConfig {
  usdToEurvRate: number;
  eurToEurvRate: number;
}

export interface AdminAuthProfile {
  id: string;
  username: string;
  passCode: string;
}

export interface UserBulkBalance {
  userId: string;
  balances: Record<string, number>;
}

export interface ReferralCommissionConfig {
  [COMMISSION_TYPE.BRANCH]: BranchCommissionConfig;
}

export interface BranchCommissionConfig {
  values: number[];
  unit: FEE_UNIT;
  minKycLevelRequired: number;
  currency: APP_CURRENCY;
}
