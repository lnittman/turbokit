import 'server-only';
import Stripe from 'stripe';
import { keys } from './keys';

const secret = keys().STRIPE_SECRET_KEY;

export const stripe = secret
  ? new Stripe(secret, {
      apiVersion: '2025-04-30.basil',
    })
  : null;

export const ensureStripe = (): Stripe => {
  if (!stripe) {
    throw new Error('Stripe not configured. Set STRIPE_SECRET_KEY to enable payments.');
  }
  return stripe;
};

export type { Stripe } from 'stripe';
