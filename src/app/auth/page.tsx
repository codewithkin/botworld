'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

function AuthPage() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const signInWithEmail = useMutation({
    mutationKey: ['email-sign-in'],
    mutationFn: async () => {
      await authClient.signIn.magicLink({
        email,
        callbackURL: '/dashboard',
      });
    },
    onSuccess: () => {
      toast.success('Magic link sent! Check your email.');
      setEmailSent(true);
    },
    onError: () => {
      toast.error('Failed to send email. Please try again.');
    },
  });

  const signInWithGoogle = useMutation({
    mutationKey: ['google-sign-in'],
    mutationFn: async () => {
      const data = await authClient.signIn.social({
        provider: 'google',
      });
    },
    onError: () => {
      toast.error('Google sign-in failed. Try again.');
    },
  });

  const isLoading = signInWithEmail.isPending || signInWithGoogle.isPending;

  return (
    <section className="min-h-screen w-full flex flex-col justify-center items-center px-4">
      <article className="flex flex-col gap-8 md:min-w-[400px] w-full md:w-fit">
        <h2 className="text-2xl font-semibold capitalize text-center">Welcome back</h2>

        <article className="flex flex-col gap-4">
          {/* Email input */}
          <article className="flex flex-col gap-1">
            <Label htmlFor="email">Your Email</Label>
            <Input
              className="py-6 px-4"
              id="email"
              type="email"
              placeholder="kin@botworld.pro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailSent || isLoading}
            />
          </article>

          {/* Sign in with email button */}
          <Button
            onClick={() => signInWithEmail.mutate()}
            disabled={!email || isLoading || emailSent}
            className="w-full py-6 px-4"
          >
            {signInWithEmail.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending magic link...
              </>
            ) : (
              'Sign in with email'
            )}
          </Button>
        </article>

        {/* OR divider */}
        <div className="text-center text-sm text-muted-foreground">or</div>

        {/* Sign in with Google */}
        <Button
          onClick={() => signInWithGoogle.mutate()}
          disabled={isLoading || emailSent}
          variant="outline"
          className="w-full py-6 px-4"
        >
          {signInWithGoogle.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in with Google...
            </>
          ) : (
            <>
              <Image src="/icons/google.png" alt="Google" width={24} height={24} />
              Sign in with Google
            </>
          )}
        </Button>
      </article>
    </section>
  );
}

export default AuthPage;
