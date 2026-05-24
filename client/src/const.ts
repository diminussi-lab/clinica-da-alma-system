export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const DEFAULT_RETURN_TO = "/dashboard";

const getCurrentOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "";
};

const normalizeReturnTo = (returnTo?: string) => {
  if (!returnTo) return DEFAULT_RETURN_TO;
  if (!returnTo.startsWith("/")) return DEFAULT_RETURN_TO;
  if (returnTo.startsWith("//")) return DEFAULT_RETURN_TO;
  return returnTo;
};

// Mantém o nome usado pelo restante do app, mas não usa mais Manus OAuth.
// Esta URL cria uma sessão local no backend e redireciona para a área interna.
export const getLoginUrl = (returnTo: string = DEFAULT_RETURN_TO) => {
  const url = new URL("/api/local-login", getCurrentOrigin());
  url.searchParams.set("returnTo", normalizeReturnTo(returnTo));

  return url.toString();
};
