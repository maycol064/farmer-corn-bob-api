export interface PurchasePolicyPort {
  isAllowed(userId: string): Promise<{
    allowed: boolean;
    remaining: number;
    retryAfterMs: number;
    resetAfterMs: number;
  }>;
}

export class PurchasePolicy {
  constructor(private limiter: PurchasePolicyPort) {}

  async canBuy(userId: string) {
    return this.limiter.isAllowed(userId);
  }
}
