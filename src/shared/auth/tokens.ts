const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function loadAccessTokenFromStorage() {
  accessToken = localStorage.getItem(ACCESS_KEY);
  return accessToken;
}

export function clearTokens() {
  accessToken = null;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
