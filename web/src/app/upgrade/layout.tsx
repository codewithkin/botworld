import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
    title: "Upgrade your account"
}

function UpgradeLayout({ children }: { children: ReactNode }) {
    return (
        <>
            {children}
        </>
    )
}

export default UpgradeLayout
