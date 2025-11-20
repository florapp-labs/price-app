import { NextRequest } from 'next/server';
import { getAccountById } from '@/domains/accounts/repositories/account.repository';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return Response.json({ error: 'Missing id' }, { status: 400 });
    }
  try {
    const account = await getAccountById(id);
    if (!account) {
      return Response.json(null, { status: 200 });
    }
    return Response.json(account);
  } catch (e: any) {
    console.error('[API Account] Failed to load account', e);
    return Response.json({ error: 'Failed to load account' }, { status: 500 });
  }
}
