"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Rocket, Bot, Satellite } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl text-center space-y-6">
        {/* Animated 404 number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex items-center justify-center gap-4"
        >
          <Satellite className="h-16 w-16 text-primary rotate-45" />
          <h1 className="text-9xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            404
          </h1>
          <Bot className="h-16 w-16 text-secondary -scale-x-100" />
        </motion.div>

        {/* Main content */}
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight">
            Lost in the Chatosphere?
          </h2>

          <p className="text-muted-foreground text-lg">
            Our bots scoured the neural networks, but this page seems to be
            <span className="inline-block mx-2 border-b-2 border-dashed border-primary">
              off the training data
            </span>
          </p>

          {/* Fun bot fact */}
          <div className="py-4 px-6 bg-accent/30 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground italic">
              Did you know? The first chatbot ELIZA was created in 1966 -
              ancient history in bot years!
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-4 justify-center pt-8">
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard">
                <Rocket className="h-4 w-4" />
                Beam Me Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Floating bot animation */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-8 right-8 opacity-10"
        >
          <Bot className="h-32 w-32" />
        </motion.div>
      </div>
    </div>
  );
}
