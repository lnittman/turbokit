import { autumn as autumnClient } from "./components/autumn";

// Re-export the Autumn client instance
export const autumn = autumnClient;

// Re-export the API methods to mirror docs usage
export const {
  track,
  cancel,
  query,
  attach,
  check,
  checkout,
  usage,
  setupPayment,
  createCustomer,
  listProducts,
  billingPortal,
  createReferralCode,
  redeemReferralCode,
  createEntity,
  getEntity,
} = (autumn as any).api?.() ?? ({} as any);

