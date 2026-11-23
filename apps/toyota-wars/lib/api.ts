import { configureApi } from "@toyota/client";

configureApi({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
  timeout: 10000,
});

export * from "@toyota/client";
