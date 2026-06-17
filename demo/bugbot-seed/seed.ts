/**
 * DEMO-ONLY seed file. NOT imported anywhere and NOT part of the build.
 * It intentionally contains obvious problems so an automated reviewer (Bugbot)
 * reliably has something to flag during the demo. Do not copy these patterns.
 */

// Issue 1: hardcoded secret / credential leak.
const API_TOKEN = 'sk-live-1234567890abcdef1234567890abcdef';

// Issue 2: SQL built via string concatenation -> SQL injection.
export function buildUserQuery(userId: string): string {
  return 'SELECT * FROM users WHERE id = ' + userId;
}

// Issue 3: unescaped HTML -> XSS risk.
export function renderName(name: string): { __html: string } {
  return { __html: '<div>' + name + '</div>' };
}

// Issue 4: missing null check -> can throw at runtime.
export function firstUpper(value?: string): string {
  return value!.charAt(0).toUpperCase() + value!.slice(1);
}

// Issue 5: logging sensitive data to the console.
export function login(username: string, password: string): void {
  console.log('logging in', username, password, API_TOKEN);
}
