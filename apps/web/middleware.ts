import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // 1. Sinkronkan sesi Supabase Auth & refresh cookies pada setiap request
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({ name, value: '', ...options });
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
  const hostname = request.headers.get('host') || '';

  // Deteksi domain dan subdomain
  const isHubSubdomain = hostname.startsWith('hub.');
  const isMainDomain = !isHubSubdomain && (hostname === 'novarion.web.id' || hostname === 'www.novarion.web.id');

  // 2. Multi-Subdomain Routing Logic
  if (isHubSubdomain) {
    // Pada subdomain hub.novarion.web.id:
    // Root '/' dialihkan langsung ke dashboard mahasiswa / login
    if (url.pathname === '/') {
      const sessionCookie = request.cookies.get('sb-access-token') || request.cookies.get('sb-refresh-token');
      url.pathname = sessionCookie ? '/app' : '/login';
      return NextResponse.redirect(url);
    }
  } else if (isMainDomain) {
    // Pada domain utama novarion.web.id:
    // Menampilkan halaman publik/landing page. Jika akses route internal, arahkan ke hub
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/app')) {
      const hubUrl = new URL(url.pathname, `https://hub.novarion.web.id`);
      return NextResponse.redirect(hubUrl);
    }
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
