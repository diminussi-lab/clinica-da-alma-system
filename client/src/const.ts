export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const DEFAULT_RETURN_TO = "/dashboard";

const normalizeReturnTo = (returnTo?: string) => {
  if (!returnTo) return DEFAULT_RETURN_TO;
  if (!returnTo.startsWith("/")) return DEFAULT_RETURN_TO;
  if (returnTo.startsWith("//")) return DEFAULT_RETURN_TO;

  return returnTo;
};

// Login local sem OAuth e sem chamada a função serverless separada.
// O backend passa a fornecer um usuário local pelo contexto tRPC.
export const getLoginUrl = (returnTo: string = DEFAULT_RETURN_TO) => {
  return normalizeReturnTo(returnTo);
};
