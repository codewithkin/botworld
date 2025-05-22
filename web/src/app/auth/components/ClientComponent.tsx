"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

function ClientComponent() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const signInWithEmail = useMutation({
    mutationKey: ["signInWithEmail"],
    mutationFn: async () => {
      const { error } = await authClient.signIn.magicLink({
        email,
        callbackURL: "/dashboard",
      });

      if (error) {
        return toast.error(
          "An error occured while signing you in...please try again later",
        );
      }

      toast.success("Success ! Please check your email for a sign in link");

      setEmailSent(true);
    },
    onError: () => {
      toast.error("Failed to send email. Please try again.");
    },
  });

  const signInWithGoogle = useMutation({
    mutationKey: ["google-sign-in"],
    mutationFn: async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    },
    onError: () => {
      toast.error("Google sign-in failed. Try again.");
    },
  });

  const isLoading = signInWithEmail.isPending || signInWithGoogle.isPending;

  return (
    <section className="min-h-screen w-full flex flex-col justify-center items-center p-8">
      <motion.article
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-8 md:min-w-[400px] w-full md:w-fit"
      >
        <article className="flex flex-col gap-2 items-center justify-center">
          <h2 className="text-2xl font-semibold capitalize text-center md:text-4xl">
            Welcome back
          </h2>
          <p className="text-muted-foreground">
            Creating social media bots just got way easier.
          </p>
        </article>

        <article className="flex flex-col gap-4">
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

          <Button
            onClick={() => signInWithEmail.mutate()}
            disabled={!email || isLoading || emailSent}
            variant="default"
            className="w-full py-6 px-4"
          >
            {signInWithEmail.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending magic link...
              </>
            ) : (
              "Sign in with email"
            )}
          </Button>
        </article>

        <div className="text-center text-sm text-muted-foreground">or</div>

        <Button
          onClick={() => signInWithGoogle.mutate()}
          disabled={isLoading || emailSent}
          variant="outline"
          className="w-full py-6 px-4"
        >
          {signInWithGoogle.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in with Google...
            </>
          ) : (
            <>
              <Image
                src="/icons/google.png"
                alt="Google"
                width={24}
                height={24}
              />
              Sign in with Google
            </>
          )}
        </Button>
      </motion.article>
    </section>
  );
}

export default ClientComponent;
