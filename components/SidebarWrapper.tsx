'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

export function SidebarWrapper() {
    const pathname = usePathname()

    // Login sayfasında sidebar gösterme
    if (pathname?.startsWith('/login')) {
        return null
    }

    return <Sidebar />
}

