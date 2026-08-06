import pg from "pg";

import { API_BASE_URL, E2E_ADMIN_EMAIL, E2E_PASSWORD } from "./credentials";

const DATABASE_URL =
  process.env.E2E_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@db:5432/app";

async function withClient<T>(fn: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export type AuthCodePurpose = "login" | "password_reset";

export async function readLatestAuthCode(options: {
  email: string;
  purpose: AuthCodePurpose;
  timeoutMs?: number;
}): Promise<string> {
  const { email, purpose, timeoutMs = 10_000 } = options;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const code = await withClient(async (client) => {
      const result = await client.query<{ code: string }>(
        `SELECT c.code
         FROM users_emailauthcode AS c
         INNER JOIN users_user AS u ON u.id = c.user_id
         WHERE LOWER(u.email) = LOWER($1)
           AND c.purpose = $2
           AND c.validated_at IS NULL
         ORDER BY c.expiration_date DESC
         LIMIT 1`,
        [email, purpose],
      );
      return result.rows[0]?.code ?? "";
    });
    if (/^\d{6}$/.test(code)) {
      return code;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(
    `Timed out waiting for ${purpose} auth code for ${email}`,
  );
}

async function adminAccessToken(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: E2E_ADMIN_EMAIL, password: E2E_PASSWORD }),
  });
  if (!response.ok) {
    throw new Error(`Admin token request failed: ${response.status}`);
  }
  const data = (await response.json()) as { access?: string };
  if (!data.access) {
    throw new Error("Admin token response missing access token");
  }
  return data.access;
}

export async function setUserPassword(
  email: string,
  password: string,
): Promise<void> {
  const access = await adminAccessToken();
  const listResponse = await fetch(
    `${API_BASE_URL}/api/v1/users/?search=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${access}` } },
  );
  if (!listResponse.ok) {
    throw new Error(`User search failed: ${listResponse.status}`);
  }
  const listData = (await listResponse.json()) as {
    results?: Array<{ id: number; email: string }>;
  };
  const user = listData.results?.find(
    (row) => row.email.toLowerCase() === email.toLowerCase(),
  );
  if (!user) {
    throw new Error(`User not found for password reset: ${email}`);
  }

  const updateResponse = await fetch(`${API_BASE_URL}/api/v1/users/${user.id}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${access}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
  if (!updateResponse.ok) {
    throw new Error(
      `Failed to set password for ${email}: ${updateResponse.status}`,
    );
  }
}
