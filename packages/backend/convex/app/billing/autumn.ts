import { Autumn } from "@useautumn/convex";
import { components } from "../../_generated/api";

export const autumn = new Autumn(components.autumn, {
	identify: async (ctx: any) => {
		const user = await ctx.auth.getUserIdentity?.();
		if (!user) return { customerId: "anonymous" } as any;
		return {
			customerId: (user.subject || user.tokenIdentifier || "user") as string,
			customerData: { email: (user as any).email, name: (user as any).name },
		};
	},
	secretKey: process.env.AUTUMN_SECRET_KEY || "",
});

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
