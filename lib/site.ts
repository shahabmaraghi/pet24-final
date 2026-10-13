export function siteUrl() {
  const candidates = [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXTAUTH_URL, "https://pet24.ir"];
  for (const raw of candidates) {
    if (!raw) continue;
    const url = raw.replace(/\/$/, "");
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url)) continue;
    return url;
  }
  return "https://pet24.ir";
}

export const NOINDEX = { robots: { index: false, follow: false } } as const;
