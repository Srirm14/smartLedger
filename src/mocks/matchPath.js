/**
 * MSW wildcard path patterns often miss root URLs (e.g. /stock_management/...).
 * Pathname predicates work on any host/port.
 */
export function pathIs(pathname) {
  return ({ request }) => new URL(request.url).pathname === pathname;
}

export function pathRegex(re) {
  return ({ request }) => re.test(new URL(request.url).pathname);
}
