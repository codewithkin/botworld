import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar';

function AppSideBar() {
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
