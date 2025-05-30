import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LandingPage />;
}

function LandingPage() {
  const { data, isPending } = authClient.useSession();

  useEffect(() => {
    if (data) {
      redirect({ to: "/dashboard" });
    } else {
      redirect({ to: "/auth" });
    } 
  }, [data, isPending]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return null;
}
