const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export function redirectToCognito(): void {
  const loginUrl =
    process.env.NEXT_PUBLIC_COGNITO_LOGIN_URL ||
    `${API_BASE}/api/v1/auth/cognito`;
  window.open(loginUrl, "_self");
}

export function redirectToLogout(): void {
  window.open(`${API_BASE}/api/v1/auth/logout`, "_self");
}
