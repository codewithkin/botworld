import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In to BotWorld",
  description: "Access your BotWorld dashboard by logging in or signing up.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
