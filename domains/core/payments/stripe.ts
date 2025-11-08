import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { getUser, getUserWithAccount } from '@/domains/users/repositories/user.repository';
import { updateUser } from '@/domains/users/repositories/user.repository';
import { Database } from '@/domains/core/database/firestore.client';
import { updateAccount } from '@/domains/accounts/repositories/account.repository';
import { updatePlanClaim } from '@/domains/core/auth/auth.claims';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function createCheckoutSession({
  userId,
  priceId,
}: {
  userId?: string;
  priceId: string;
}) {
  const {user, account} = await getUserWithAccount();
  
  if (!user && !userId) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  const userUid = userId || user?.uid;
  if (!userUid) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  // Use existing customer if available, otherwise Stripe will create a new one
  const customerId = account?.stripeCustomerId;

  const session = await stripe.checkout.sessions.create();
  redirect(session.url!);
}

export async function createCustomerPortalSession(userId: string, customerId: string, productId?: string) {
  if (!customerId || !productId) {
    redirect('/pricing');
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await stripe.products.retrieve(productId);
    if (!product.active) {
      throw new Error("Product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription',
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id),
            },
          ],
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other',
            ],
          },
        },
        payment_method_update: {
          enabled: true,
        },
      },
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id,
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const {account} = await getUserWithAccount();
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  // Find user by stripeCustomerId
  const database = await Database();
  const userSnapshot = await database
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (userSnapshot.empty) {
    console.error('User not found for Stripe customer:', customerId);
    return;
  }

  const userDoc = userSnapshot.docs[0];
  const userId = userDoc.id;

  if (status === 'active' || status === 'trialing') {
    const plan = subscription.items.data[0]?.plan;
    const productId =
      typeof plan?.product === 'string'
        ? plan.product
        : (plan?.product as Stripe.Product)?.id;

    // Determine plan based on product
    let planName: 'FREE' | 'PRO' = 'FREE';
    if (productId) {
      const product = await stripe.products.retrieve(productId);
      planName = product.name?.toUpperCase() === 'PRO' ? 'PRO' : 'FREE';
    }

    await updateAccount(account.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: productId || undefined,
      planName,
      subscriptionStatus: status,
    });

    // Update custom claims so planName is available in token
    await updatePlanClaim(userId, planName);
  } else if (status === 'canceled' || status === 'unpaid') {
    await updateAccount(account.id, {
      stripeSubscriptionId: null,
      stripeProductId: undefined,
      planName: 'FREE',
      subscriptionStatus: status,
    });

    // Update custom claims to FREE when subscription is canceled
    await updatePlanClaim(userId, 'FREE');
  }
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring',
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days,
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price'],
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id,
  }));
}

