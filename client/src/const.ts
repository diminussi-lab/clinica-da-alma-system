export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

function getSafeAbsoluteUrl(rawValue: unknown ): URL | null {
  if (typeof rawValue !== "string") return null;

  const value = rawValue.trim();

  if (!value || value === "undefined" || value === "null") {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getLocalFallbackLoginUrl(): string {
  if (typeof window === "undefined") return "/";
  return "/";
}

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  if (typeof window === "undefined") return "/";

  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = new URL("/api/oauth/callback", window.location.origin).toString();
  const state = window.btoa(redirectUri);

  const oauthBaseUrl = getSafeAbsoluteUrl(oauthPortalUrl);

  if (!oauthBaseUrl || !appId) {
    console.warn(
      "OAuth não configurado. Defina VITE_OAUTH_PORTAL_URL e VITE_APP_ID na Vercel se o login externo for necessário."
    );
    return getLocalFallbackLoginUrl();
  }

  const url = new URL("/app-auth", oauthBaseUrl.origin);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
