'use client';

import { useSignupForm } from './context';

function SignupFormMessages() {
  const { error, success } = useSignupForm();

  if (!error && !success) return null;

  return (
    <>
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-400">
          Conta criada! Redirecionando...
        </div>
      )}
    </>
  );
}

export { SignupFormMessages };
