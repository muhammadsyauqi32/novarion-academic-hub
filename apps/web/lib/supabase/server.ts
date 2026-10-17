import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

/**
 * Deteksi apakah request berasal dari domain produksi *.novarion.web.id
 * agar cookie sesi dapat dibagikan di subdomain (hub.novarion.web.id & novarion.web.id)
 */
function getSharedCookieDomain(): string | undefined {
  try {
    const headersList = headers();
    const host = headersList.get('host') || '';
    if (host.includes('novarion.web.id')) {
      return '.novarion.web.id';
    }
  } catch {
    // Di luar konteks request Next.js (misalnya static build atau script)
  }
  return undefined;
}

export function createClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  const sharedDomain = getSharedCookieDomain();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          const cookieOptions: CookieOptions = {
            ...options,
            ...(sharedDomain ? { domain: sharedDomain } : {}),
          };
          cookieStore.set({ name, value, ...cookieOptions });
        } catch {
          // Can happen in Server Components, handled gracefully
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          const cookieOptions: CookieOptions = {
            ...options,
            maxAge: 0,
            ...(sharedDomain ? { domain: sharedDomain } : {}),
          };
          cookieStore.set({ name, value: '', ...cookieOptions });
        } catch {
          // Can happen in Server Components
        }
      },
    },
  });
}

