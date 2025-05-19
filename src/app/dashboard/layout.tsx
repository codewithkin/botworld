import Sidebar from '@/components/shared/Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ReactNode } from 'react';

function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar />
      <main className="p-4 md:p-8 w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}

export default DashboardLayout;
