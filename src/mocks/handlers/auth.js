import { http, HttpResponse } from "msw";
import { delayWrite } from "../utils.js";

function mockLoginResponse() {
  return HttpResponse.json({
    access_token: "mock.jwt.access.token",
    refresh_token: "mock.jwt.refresh.token",
  });
}

function mockLoginUnauthorized() {
  return HttpResponse.json(
    { message: "Invalid credentials" },
    { status: 401 }
  );
}

async function credentialsOk(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    /* empty */
  }
  const email = String(body.email ?? body.username ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  return (
    (email === "test" && password === "test123") ||
    (email === "demo@gmail.com" && password === "demo123")
  );
}

export const authHandlers = [
  http.post("*/login", async ({ request }) => {
    await delayWrite();
    return (await credentialsOk(request))
      ? mockLoginResponse()
      : mockLoginUnauthorized();
  }),

  /** Alias for `@/services/auth` and other clients that use `/auth/login` */
  http.post("*/auth/login", async ({ request }) => {
    await delayWrite();
    return (await credentialsOk(request))
      ? mockLoginResponse()
      : mockLoginUnauthorized();
  }),

  http.post("*/auth/register", async () => {
    await delayWrite();
    return HttpResponse.json({ message: "Registered (mock)." });
  }),

  /** `@/services/auth` (CRA-style) — same-origin relative paths */
  http.post("*/auth/forgot-password", async () => {
    await delayWrite();
    return HttpResponse.json({ message: "Reset link sent (mock)." });
  }),

  http.post("*/auth/reset-password", async () => {
    await delayWrite();
    return HttpResponse.json({ message: "Password updated (mock)." });
  }),

  http.post("*/register", async () => {
    await delayWrite();
    return HttpResponse.json({ message: "Registered — check email (mock)." });
  }),

  http.post("*/otp_verification", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/forget_password", async () => {
    await delayWrite();
    return HttpResponse.json({ message: "Reset link sent (mock)." });
  }),

  http.post("*/otp_confirmation", async () => {
    await delayWrite();
    return HttpResponse.json({ access_token: "mock.reset.token" });
  }),

  http.post("*/change_password", async () => {
    await delayWrite();
    return HttpResponse.json({ message: "Password updated (mock)." });
  }),

  http.post("*/refresh", async ({ request }) => {
    await delayWrite();
    const url = new URL(request.url);
    const rt = url.searchParams.get("request");
    if (rt) {
      return HttpResponse.json({
        access_token: "mock.jwt.access.token.refreshed",
        refresh_token: rt,
      });
    }
    return HttpResponse.json({ message: "Invalid refresh" }, { status: 401 });
  }),
];
