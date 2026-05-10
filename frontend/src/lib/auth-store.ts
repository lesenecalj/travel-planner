/**
 * Module-level access token store.
 * The token lives in memory only — it is lost on page reload by design.
 * Never stored in localStorage or sessionStorage (XSS protection).
 */
let _accessToken: string | null = null;

export const authStore = {
  get: () => _accessToken,
  set: (token: string | null) => {
    _accessToken = token;
  },
};
