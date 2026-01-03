'use client'

import { usePathname } from 'next/navigation'

export function ContentWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isLoginPage = pathname?.startsWith('/login')

    if (isLoginPage) {
        return <>{children}</>
    }

    return <div className="md:ml-64">{children}</div>
}

