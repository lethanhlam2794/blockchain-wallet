export class UserDepositedEvent {
  public static from(data: Partial<UserDepositedEvent>): UserDepositedEvent {
    const instance = new UserDepositedEvent();

    Object.assign(instance, data);

    return instance;
  }

  userId: string;
  walletAddress: string;
  amount: number;
  currency: string;
  refCode: string;
  txHash: string;
}

export class UserWithdrawnEvent {
  public static from(data: Partial<UserWithdrawnEvent>): UserWithdrawnEvent {
    const instance = new UserWithdrawnEvent();

    Object.assign(instance, data);

    return instance;
  }

  userId: string;
  walletAddress: string;
  amount: number;
  currency: string;
  refCode: string;
  txHash: string;
}
