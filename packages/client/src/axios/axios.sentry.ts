export async function captureApiError(
  error: any,
  status?: number,
  endpoint?: string,
  errors?: any[],
) {
  const Sentry = await import("@sentry/react");
  Sentry.withScope((scope) => {
    scope.setLevel("error");
    scope.setTag("status_code", String(status || "unknown"));
    scope.setTag("endpoint", endpoint || "unknown");
    if (errors) scope.setContext("api_error_payload", { errors });
    Sentry.captureException(error);
  });
}
