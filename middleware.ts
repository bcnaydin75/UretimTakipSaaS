import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase-middleware'

export async function middleware(request: NextRequest) {
    // Session refresh ve auth kontrolü
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Aşağıdaki yollar dışındaki tüm yolları eşleştir:
         * - api (API rotaları)
         * - _next/static (statik dosyalar)
         * - _next/image (resim optimizasyon dosyaları)
         * - favicon.ico (favicon dosyası)
         * - public klasörü altındaki statik varlıklar
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
