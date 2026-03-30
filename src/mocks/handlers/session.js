import { http, HttpResponse } from "msw";
import { delayGet } from "../utils.js";
import { db } from "../db/index.js";
import { DEMO_ORGANISATION_NAME, DEMO_USER_EMAIL, DEMO_USER_NAME } from "../demo.js";

/**
 * Session / identity — matches any path ending in Organisation or user (any prefix, case on “O”).
 * Covers http://host/Organisation, …/api/Organisation, etc.
 */
export const sessionHandlers = [
  http.get(/.*\/[Oo]rganisation\/?$/, async () => {
    await delayGet();
    return HttpResponse.json({
      organisation: db.organisation?.name ?? DEMO_ORGANISATION_NAME,
    });
  }),

  http.get(/.*\/user\/?$/, async () => {
    await delayGet();
    const base = db.user ?? {};
    const orgName =
      db.organisation?.name ?? DEMO_ORGANISATION_NAME;
    return HttpResponse.json({
      ...base,
      email: base.email ?? DEMO_USER_EMAIL,
      username: base.username ?? "demo",
      name: base.name ?? DEMO_USER_NAME,
      organisation_id: base.organisation_id ?? 1,
      organisation: orgName,
    });
  }),
];
