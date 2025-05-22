import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function NewBotFAB() {
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
