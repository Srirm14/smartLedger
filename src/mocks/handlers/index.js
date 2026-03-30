import { authHandlers } from "./auth.js";
import { domainHandlers } from "./domain.js";
import { reportHandlers } from "./reports.js";

export const handlers = [...authHandlers, ...reportHandlers, ...domainHandlers];
