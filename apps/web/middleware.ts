import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const t0 = performance.now();
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const hostname = request.headers.get('host') || '';
  const isProdNovarion = hostname.includes('novarion.web.id');
  const sharedDomain = isProdNovarion ? '.novarion.web.id' : undefined;

  const pathname = request.nextUrl.pathname;
  const isHubSubdomain = hostname.startsWith('hub.');
  const isMainDomain = !isHubSubdomain && (hostname === 'novarion.web.id' || hostname === 'www.novarion.web.id');

  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'));

  // Cek apakah access token masih valid dan belum mendekati masa kedaluwarsa (>90 detik tersisa)
  // Ini menghindari network roundtrip ganda ke server Supabase Auth pada setiap klik / RSC prefetch
  const isFreshToken = (() => {
    try {
      const authCookies = allCookies.filter((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
      if (authCookies.length === 0) return false;
      let raw = authCookies
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => c.value)
        .join('');
      if (raw.startsWith('base64-')) {
        raw = Buffer.from(raw.slice(7), 'base64').toString('utf-8');
      }
      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return false;
      }
      const token = parsed.access_token || (Array.isArray(parsed) ? parsed[0] : null);
      if (!token || typeof token !== 'string') return false;
      const parts = token.split('.');
      if (parts.length < 2) return false;
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
      if (!payload.exp) return false;
      const nowSec = Math.floor(Date.now() / 1000);
      return payload.exp - nowSec > 90;
    } catch {
      return false;
    }
  })();

  const isRscRequest = request.nextUrl.searchParams.has('_rsc') || request.headers.get('rsc') === '1';

  // Jalankan sinkronisasi Supabase Auth HANYA jika token perlu di-refresh atau pada dokumen navigasi penuh
  // saat token mendekati masa kadaluwarsa (<=90s)
  const requiresAuthSync =
    hasAuthCookie &&
    !isFreshToken &&
    (isHubSubdomain ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/app') ||
      pathname.startsWith('/auth') ||
      pathname === '/login');

  if (supabaseUrl && supabaseAnonKey && requiresAuthSync) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            const cookieOptions: CookieOptions = {
              ...options,
              ...(sharedDomain ? { domain: sharedDomain } : {}),
            };
            request.cookies.set({ name, value, ...cookieOptions });
            response.cookies.set({ name, value, ...cookieOptions });
          },
          remove(name: string, options: CookieOptions) {
            const cookieOptions: CookieOptions = {
              ...options,
              maxAge: 0,
              ...(sharedDomain ? { domain: sharedDomain } : {}),
            };
            request.cookies.set({ name, value: '', ...cookieOptions });
            response.cookies.set({ name, value: '', ...cookieOptions });
          },
        },
      });

      // Panggil getUser() untuk me-refresh token sesi secara aman jika mendekati expired
      await supabase.auth.getUser();
    } catch {
      // Abaikan jika inisialisasi sementara terkendala
    }
  }

  const url = request.nextUrl.clone();

  // Helper untuk redirect dengan mempertahankan seluruh cookie yang baru diset
  const createRedirectWithCookies = (targetUrl: URL | string) => {
    const redirectRes = NextResponse.redirect(targetUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie);
    });
    return redirectRes;
  };

  // 2. Multi-Subdomain Routing Logic
  if (isHubSubdomain) {
    // Pada subdomain hub.novarion.web.id:
    // Root '/' dialihkan langsung ke dashboard mahasiswa / login
    if (url.pathname === '/') {
      url.pathname = hasAuthCookie ? '/app' : '/login';
      return createRedirectWithCookies(url);
    }
  } else if (isMainDomain) {
    // Pada domain utama novarion.web.id:
    // Menampilkan halaman publik/landing page. Jika akses route internal atau login, arahkan ke hub
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/app') || url.pathname === '/login') {
      const hubUrl = new URL(url.pathname, `https://hub.novarion.web.id`);
      return createRedirectWithCookies(hubUrl);
    }
  }

  const elapsed = performance.now() - t0;
  if (process.env.NODE_ENV !== 'production' || elapsed > 100) {
    console.log(`[Middleware] ${request.method} ${request.nextUrl.pathname} took ${elapsed.toFixed(1)}ms`);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match semua request paths kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Gambar dan media statis (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
