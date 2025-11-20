'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { getUser, getUserWithAccount } from '@/domains/users/repositories/user.repository';

export async function checkoutAction(formData: FormData) {
  const priceId = formData.get('priceId') as string;
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-up');
  }

  await createCheckoutSession({ userId: user.uid, priceId });
}

export async function customerPortalAction() {
  const {account} = await getUserWithAccount();
  
  if (!account?.stripeCustomerId || !account.stripeProductId) {
    redirect('/pricing');
  }

  const portalSession = await createCustomerPortalSession(
    account.id,
    account.stripeCustomerId,
    account.stripeProductId
  );
  redirect(portalSession.url);
}

