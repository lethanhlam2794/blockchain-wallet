export const generateDepositMsg = (refCode: string, amount: number): string => {
  return `${refCode.toUpperCase()} ${amount}`;
};
