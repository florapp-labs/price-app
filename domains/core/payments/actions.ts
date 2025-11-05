'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { getUser } from '@/domains/users/repositories/user.repository';

export async function checkoutAction(formData: FormData) {
  const priceId = formData.get('priceId') as string;
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-up');
  }

  await createCheckoutSession({ userId: user.uid, priceId });
}

export async function customerPortalAction() {
  const user = await getUser();
  
  if (!user?.stripeCustomerId || !user.stripeProductId) {
    redirect('/pricing');
  }

  const portalSession = await createCustomerPortalSession(
    user.uid,
    user.stripeCustomerId,
    user.stripeProductId
  );
  redirect(portalSession.url);
}

