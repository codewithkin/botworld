import Sidebar from '@/components/shared/Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ReactNode } from 'react';

function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}

export default DashboardLayout;
