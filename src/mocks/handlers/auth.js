import { http, HttpResponse } from "msw";
import { delayWrite } from "../utils.js";

export const authHandlers = [
  http.post("*/login", async ({ request }) => {
    await delayWrite();
    let body = {};
    try {
      body = await request.json();
    } catch {
      /* empty */
    }
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const ok =
      (email === "test" && password === "test123") ||
      (email === "demo@gmail.com" && password === "demo123");
    if (ok) {
      return HttpResponse.json({
        access_token: "mock.jwt.access.token",
        refresh_token: "mock.jwt.refresh.token",
      });
    }
    return HttpResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
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
