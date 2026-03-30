import { authHandlers } from "./auth.js";
import { sessionHandlers } from "./session.js";
import { reportHandlers } from "./reports.js";
import { domainHandlers } from "./domain.js";

/** Order: auth → session (org/user) → reports → domain (bulk CRUD). */
export const handlers = [
  ...authHandlers,
  ...sessionHandlers,
  ...reportHandlers,
  ...domainHandlers,
];
