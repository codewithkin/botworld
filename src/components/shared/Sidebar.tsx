import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';
import { BanknoteArrowUp, BotMessageSquare, ChartLine, DoorOpen, Settings2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

function AppSideBar() {
  // Get the user's data
  const { data, isPending } = authClient.useSession();

  const primaryLinks = [
    {
      name: 'Dashboard',
      slug: 'dashboard',
      icon: <ChartLine />,
    },
    {
      name: 'Bots',
      slug: 'bots',
      icon: <BotMessageSquare />,
    },
  ];

  const secondaryLinks = [
    {
      name: 'Settings',
      slug: 'settings',
      icon: <Settings2 />,
    },
    {
      name: 'Profile',
      slug: 'profile',
      icon: (
        <Avatar>
          <AvatarImage src={data?.user?.image || ''} alt={`${data?.user?.email}'s avatar`} />
          <AvatarFallback>{data?.user?.email.charAt(0)}</AvatarFallback>
        </Avatar>
      ),
    },
  ];

  const footerLinks = [
    {
      name: 'Logout',
      slug: 'logout',
      icon: <DoorOpen />,
    },
    {
      name: 'Billing',
      slug: 'billing',
      icon: <BanknoteArrowUp />,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="text-xl font-semibold text-primary">Botworld</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}

export default AppSideBar;
