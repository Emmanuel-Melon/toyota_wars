import type { Request } from "express";

export const getAccessToken = (req: Request): string | undefined => {
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  if (cookies?.accessToken) {
    return cookies.accessToken;
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return undefined;
};
