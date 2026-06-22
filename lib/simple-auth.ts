import crypto from "crypto";
import type { IncomingMessage } from "http";
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

const SESSION_COOKIE_NAME = "sl_dashboard_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type VerifiedSession = {
  username: string;
  expiresAt: number;
};

type DashboardAuthResult =
  | { ok: true; session: VerifiedSession }
  | { ok: false; status: number; message: string };

function getAuthSecret() {
  return process.env.SL_AUTH_SECRET?.trim() || null;
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64").toString("utf8");
}

function parseCookies(cookieHeader?: string | null) {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, chunk) => {
    const index = chunk.indexOf("=");
    if (index === -1) return acc;
    const key = chunk.slice(0, index).trim();
    const value = chunk.slice(index + 1).trim();
    if (key) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});
}

function signPayload(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function buildSessionValue(username: string, expiresAt: number, secret: string) {
  const encodedUsername = base64UrlEncode(username);
  const payload = `${encodedUsername}.${expiresAt}`;
  const signature = signPayload(payload, secret);
  return `${payload}.${signature}`;
}

function buildCookieHeader(value: string, expires: Date) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}; Expires=${expires.toUTCString()}${secure}`;
}

function clearCookieHeader() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=${new Date(0).toUTCString()}${secure}`;
}

function readSessionToken(req: IncomingMessage | NextApiRequest) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_COOKIE_NAME] || null;
}

function verifySessionToken(token: string | null): VerifiedSession | null {
  if (!token) return null;

  const secret = getAuthSecret();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedUsername, expiresAtRaw, signature] = parts;
  const payload = `${encodedUsername}.${expiresAtRaw}`;
  const expectedSignature = signPayload(payload, secret);

  try {
    const provided = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
      return null;
    }

    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
      return null;
    }

    const username = base64UrlDecode(encodedUsername).trim();
    if (!username) return null;

    return {
      username,
      expiresAt,
    };
  } catch (error) {
    return null;
  }
}

export function signSession(username: string) {
  const secret = getAuthSecret();
  if (!secret) {
    throw new Error("SL_AUTH_SECRET is not configured.");
  }

  const normalizedUsername = username.trim();
  if (!normalizedUsername) {
    throw new Error("A username is required to sign a session.");
  }

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  return {
    token: buildSessionValue(normalizedUsername, expiresAt, secret),
    expiresAt,
    cookieName: SESSION_COOKIE_NAME,
  };
}

export function verifySessionFromRequest(req: IncomingMessage | NextApiRequest) {
  return verifySessionToken(readSessionToken(req));
}

export function isValidDashboardLogin(username: string, password: string) {
  const expectedUsername = process.env.SL_DASHBOARD_USERNAME?.trim();
  const expectedPassword = process.env.SL_DASHBOARD_PASSWORD?.trim();

  if (!expectedUsername || !expectedPassword) {
    return false;
  }

  return username.trim() === expectedUsername && password === expectedPassword;
}

export function setDashboardSessionCookie(res: NextApiResponse, username: string) {
  const session = signSession(username);
  res.setHeader("Set-Cookie", buildCookieHeader(session.token, new Date(session.expiresAt)));
  return {
    username: session.token ? username.trim() : username.trim(),
    expiresAt: session.expiresAt,
  };
}

export function clearDashboardSessionCookie(res: NextApiResponse) {
  res.setHeader("Set-Cookie", clearCookieHeader());
}

export function requireDashboardAuth(req: NextApiRequest, _res: NextApiResponse): DashboardAuthResult {
  const session = verifySessionFromRequest(req);

  if (!session) {
    return {
      ok: false,
      status: 401,
      message: "Unauthorized.",
    };
  }

  return {
    ok: true,
    session,
  };
}

export function getDashboardPageAuthRedirect(context: GetServerSidePropsContext) {
  const session = verifySessionFromRequest(context.req);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    } as const;
  }

  return {
    props: {
      dashboardUser: session.username,
    },
  } as const;
}

export function getLoginPageRedirectIfAuthenticated(context: GetServerSidePropsContext) {
  const session = verifySessionFromRequest(context.req);

  if (!session) {
    return { props: {} } as const;
  }

  return {
    redirect: {
      destination: "/dashboard/garage",
      permanent: false,
    },
  } as const;
}
