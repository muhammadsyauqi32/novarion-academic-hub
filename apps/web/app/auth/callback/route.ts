import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDb, studentWhitelist, profiles } from '@novarion/db';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !user || !user.email) {
    console.error('[AuthCallback] Exchange error:', error);
    return NextResponse.redirect(`${origin}/login?error=auth_exchange_failed`);
  }

  const db = getDb();
  const verifiedEmail = user.email.toLowerCase();

  // 1. Validasi ketat terhadap student_whitelist
  const whitelistRows = await db
    .select()
    .from(studentWhitelist)
    .where(eq(studentWhitelist.email, verifiedEmail))
    .limit(1);

  if (whitelistRows.length === 0 || !whitelistRows[0].isActive) {
    console.warn(`[AuthCallback] Akses ditolak: Email '${verifiedEmail}' tidak ada di whitelist atau nonaktif.`);
    // Invalidate session segera
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/auth/invalid-account`);
  }

  const wl = whitelistRows[0];
  const avatarUrl = user.user_metadata?.avatar_url || null;

  // 2. Kaitkan secara unik dengan profiles
  const existingProfile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (existingProfile.length === 0) {
    await db.insert(profiles).values({
      id: user.id,
      nim: wl.nim,
      email: wl.email,
      fullName: wl.fullName,
      role: wl.role,
      avatarUrl,
    });
    console.log(`[AuthCallback] Profil baru dibuat untuk ${wl.fullName} (${wl.nim}) - Role: ${wl.role}`);
  } else {
    // Sinkronkan update role / nama jika berubah di whitelist
    await db
      .update(profiles)
      .set({
        fullName: wl.fullName,
        role: wl.role,
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id));
  }

  // 3. Arahkan pengguna sesuai peran (Role-based redirection)
  if (wl.role === 'admin') {
    return NextResponse.redirect(`${origin}/admin`);
  }

  return NextResponse.redirect(`${origin}/app`);
}
