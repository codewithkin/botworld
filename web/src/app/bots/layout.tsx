import NewBotFAB from "@/components/shared/NewBotFAB"
import { Sidebar, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Metadata } from "next"
import { ReactNode } from "react"

export const metadata: Metadata = {
    title: "Botworld | Your Bots"
}

function BotsLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <Sidebar />
            <NewBotFAB />
            <main className="p-4 md:p-8 w-full">
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}

export default BotsLayout
