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

  // Jalankan sinkronisasi Supabase Auth HANYA pada route yang memerlukan sesi terotentikasi.
  // Jangan bebani landing page publik atau aset statis dengan HTTP network roundtrip auth yang tidak perlu.
  const requiresAuthSync =
    hasAuthCookie &&
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

      // Panggil getUser() untuk memvalidasi token sesi secara aman
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
