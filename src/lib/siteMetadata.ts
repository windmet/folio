export const SITE_NAME = '前情帖';
export const SITE_BRAND = 'GOMYAKU / 語脈';
export const SITE_DEFAULT_DESCRIPTION = '前情帖：围绕公开广播、活动与人物语境整理的非官方档案。';

// Keep the launch decision explicit. A future public release can flip this flag
// after the content, production URL, media, and browser gates are signed off.
export const PUBLIC_LAUNCH_ENABLED = false;

const PUBLIC_ROUTE_PREFIXES = ['/', '/about/', '/indexes/', '/people/', '/projects/', '/posts/'];

export function resolveRobots(pathname: string, override?: string) {
  if (override) return override;
  if (!PUBLIC_LAUNCH_ENABLED) return 'noindex, nofollow';
  const isPublicRoute = PUBLIC_ROUTE_PREFIXES.some((prefix) =>
    prefix === '/' ? pathname === '/' : pathname.startsWith(prefix),
  );
  return isPublicRoute ? 'index, follow' : 'noindex, nofollow';
}

export function resolveCanonical(pathname: string, site?: URL, override?: string) {
  if (override) return override;
  if (!site) return undefined;
  const canonical = new URL(pathname || '/', site);
  canonical.search = '';
  canonical.hash = '';
  return canonical.toString();
}

export function resolvePageTitle(title: string) {
  return title === SITE_NAME ? SITE_NAME : `${title} — ${SITE_NAME}`;
}
