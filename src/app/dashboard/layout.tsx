import Sidebar from '@/components/shared/Sidebar';
import { ReactNode } from 'react';

function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      <Sidebar />
      {children}
    </section>
  );
}

export default DashboardLayout;
