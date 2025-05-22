'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

function ClientComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to sign in. Please try again.');
    }
  };

  return (
    <section className="min-h-screen w-full flex flex-col justify-center items-center p-8">
      <motion.article
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col gap-8 md:min-w-[400px] w-full md:w-fit"
      >
        <article className="flex flex-col gap-2 items-center justify-center">
          <h2 className="text-2xl font-semibold capitalize text-center md:text-4xl">
            Welcome back
          </h2>
          <p className="text-muted-foreground">Creating social media bots just got way easier.</p>
        </article>

        <Button
          onClick={handleSignIn}
          disabled={isLoading}
          variant="outline"
          className="w-full py-6 px-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in with Google...
            </>
          ) : (
            <>
              <Image src="/icons/google.png" alt="Google" width={24} height={24} />
              Sign in with Google
            </>
          )}
        </Button>
      </motion.article>
    </section>
  );
}

export default ClientComponent;
