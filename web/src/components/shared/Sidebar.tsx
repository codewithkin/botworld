"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import {
  BanknoteArrowUp,
  BotMessageSquare,
  ChartLine,
  DoorOpen,
  Settings2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import Link from "next/link";
import { Separator } from "@radix-ui/react-separator";

function AppSideBar() {
  const { data, isPending } = authClient.useSession();

  const primaryLinks = [
    {
      name: "Dashboard",
      slug: "/dashboard",
      icon: <ChartLine size={18} />,
    },
    {
      name: "Bots",
      slug: "/bots",
      icon: <BotMessageSquare size={18} />,
    },
  ];

  const secondaryLinks = [
    {
      name: "Settings",
      slug: "/settings",
      icon: <Settings2 size={18} />,
    },
    {
      name: "Profile",
      slug: "/profile",
      icon: (
        <Avatar className="h-6 w-6 bg-accent border text-primary border-primary font-semibold p-4">
          <AvatarImage
            src={data?.user?.image || ""}
            alt={`${data?.user?.email}'s avatar`}
          />
          <AvatarFallback>
            {data?.user?.email?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      ),
    },
  ];

  const footerLinks = [
    {
      name: "Logout",
      slug: "/logout",
      icon: <DoorOpen size={18} />,
    },
    {
      name: "Billing",
      slug: "/billing",
      icon: <BanknoteArrowUp size={18} />,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="text-xl font-semibold text-primary">BotWorld</h1>
      </SidebarHeader>

      <SidebarContent>
        {/* Primary */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          {primaryLinks.map((link) => (
            <Link
              key={link.slug}
              href={link.slug}
              className="flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-200  hover:border hover:border-primary hover:font-semibold hover:text-primary transition"
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </SidebarGroup>

        {/* Secondary */}
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>

          {secondaryLinks.map((link) => (
            <Link
              key={link.slug}
              href={link.slug}
              className="flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-200  hover:border hover:border-primary hover:font-semibold hover:text-primary transition"
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </SidebarGroup>
        <Separator className="w-full" />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        {footerLinks.map((link) => (
          <Link
            key={link.slug}
            href={link.slug}
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-200  hover:border hover:border-primary hover:font-semibold hover:text-primary transition"
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        ))}
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSideBar;
