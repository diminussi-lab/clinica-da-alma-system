export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const DEFAULT_OAUTH_PORTAL_URL = "https://manus.im";
const DEFAULT_APP_ID = "Wz8MVzUKSE5Js4yiZfrhPT";

const getCurrentOrigin = ( ) => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "";
};

const normalizeBaseUrl = (value: string | undefined) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue || trimmedValue === "undefined" || trimmedValue === "null") {
    return DEFAULT_OAUTH_PORTAL_URL;
  }

  return trimmedValue.replace(/\/+$/, "");
};

const normalizeAppId = (value: string | undefined) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue || trimmedValue === "undefined" || trimmedValue === "null") {
    return DEFAULT_APP_ID;
  }

  return trimmedValue;
};

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = normalizeBaseUrl(import.meta.env.VITE_OAUTH_PORTAL_URL);
  const appId = normalizeAppId(import.meta.env.VITE_APP_ID);
  const redirectUri = `${getCurrentOrigin()}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL("/app-auth", oauthPortalUrl);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
