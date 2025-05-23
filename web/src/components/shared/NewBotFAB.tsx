"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { plans } from "@/lib/plans/limitations";
import { DialogTitle } from "@radix-ui/react-dialog";

function NewBotFAB() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await axios.get("/api/user");
      return data;
    }
  });

  const router = useRouter();

  if (user && user.bots.length >= plans[user.plan as keyof typeof plans].bots) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow h-14 w-14 md:h-auto md:w-auto md:px-4 md:py-2 absolute bottom-4 right-4 z-50"
            size="lg"
          >
            <Plus />
            <span className="hidden md:inline">New Bot</span>
            <span className="sr-only">Create new bot</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm rounded-lg border-0 bg-gradient-to-br from-pink-100 to-orange-50 p-8 shadow-xl">
          <div className="flex flex-col items-center space-y-4">
            {/* Title with warning emoji */}
            <DialogTitle className="text-2xl font-bold text-red-600">
              🚨 Limit Reached!
            </DialogTitle>

            {/* Main content */}
            <div className="flex flex-col items-center space-y-6 text-center">
              {/* Warning icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Urgency badge */}
              <div className="animate-pulse rounded-full bg-yellow-400 px-4 py-1 text-sm font-bold text-black">
                ⏳ 30% OFF for early birds!
              </div>

              {/* Message text */}
              <p className="text-lg text-gray-800">
                You've reached your limit of{" "}
                <span className="font-bold text-red-600">
                  {plans[user.plan as keyof typeof plans].bots} bots
                </span>{" "}
                on your current plan.
              </p>

              {/* Upgrade CTA */}
              <Link
                href="/upgrade"
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
              >
                <span>✨ Upgrade Now</span>
              </Link>

              {/* Bonus offer */}
              <div className="text-sm text-gray-600">
                🎁 <span className="font-semibold">Early bird bonus:</span>
                Get premium features + 30% discount!
              </div>

              {/* Warning message */}
              <div className="mt-2 text-xs text-red-500">
                * Offer expires in 3 days
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        asChild
        className="rounded-full shadow-lg hover:shadow-xl transition-shadow h-14 w-14 md:h-auto md:w-auto md:px-4 md:py-2"
        size="lg"
      >
        <Link href="/bots/new">
          <Plus />
          <span className="hidden md:inline">New Bot</span>
          <span className="sr-only">Create new bot</span>
        </Link>
      </Button>
    </div>
  );
}


export default NewBotFAB;