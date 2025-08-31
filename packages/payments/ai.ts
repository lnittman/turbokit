import { StripeAgentToolkit } from '@stripe/agent-toolkit/ai-sdk';
import { keys } from './keys';

export const getPaymentsAgentToolkit = (): StripeAgentToolkit | null => {
  const secret = keys().STRIPE_SECRET_KEY;
  if (!secret) return null;

  return new StripeAgentToolkit({
    secretKey: secret,
    configuration: {
      actions: {
        paymentLinks: { create: true },
        products: { create: true },
        prices: { create: true },
      },
    },
  });
};
