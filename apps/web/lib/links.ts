/**
 * Helper to get the correct absolute or relative URL for Academic Hub login.
 * Ensures cross-subdomain transitions (from novarion.web.id to hub.novarion.web.id)
 * use full document navigation (native <a> tag) instead of client-side RSC routing.
 */
export function getHubLoginUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'novarion.web.id' || host === 'www.novarion.web.id') {
      return 'https://hub.novarion.web.id/login';
    }
  }

  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.includes('novarion.web.id')) {
    return 'https://hub.novarion.web.id/login';
  }

  return '/login';
}
