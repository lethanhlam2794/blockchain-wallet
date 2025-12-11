export const investmentVerificationOtpKey = (
  userId: string,
  sasId: string,
  packageId: string,
) => {
  return `user_id:${userId}:sas_id:${sasId}:package_id:${packageId}:investments_verification_otp`;
};

export const investmentSummaryKey = (userId: string) => {
  return `user_id:${userId}:investment_summary`;
};

export const commissionEarningsKey = (userId: string) => {
  return `user_id:${userId}:commission_earnings`;
};
