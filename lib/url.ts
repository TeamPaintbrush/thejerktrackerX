/**
 * Tracking URL helpers shared by web and mobile builds.
 * Prefers configured env vars but safely falls back to runtime origin.
 */
const DEFAULT_TRACKING_BASE_URL = 'https://thejerktracker0.vercel.app';

function normalizeUrl(url?: string | null): string | undefined {
  if (!url) {
    return undefined;
  }

  return url.replace(/\/$/, '');
}

function resolveEnvTrackingUrl(): string | undefined {
  const envUrl =
    process.env.NEXT_PUBLIC_QR_TRACKING_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : undefined);

  return normalizeUrl(envUrl);
}

export function getTrackingBaseUrl(): string {
  const envTrackingUrl = resolveEnvTrackingUrl();
  if (envTrackingUrl) {
    return envTrackingUrl;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return normalizeUrl(window.location.origin) ?? DEFAULT_TRACKING_BASE_URL;
  }

  return DEFAULT_TRACKING_BASE_URL;
}

export function buildTrackingUrl(path: string = ''): string {
  const baseUrl = getTrackingBaseUrl();
  if (!path) {
    return baseUrl;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
