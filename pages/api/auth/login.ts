import type { NextApiRequest, NextApiResponse } from "next";
import {
  isValidDashboardLogin,
  setDashboardSessionCookie,
} from "../../../lib/simple-auth";

type LoginResponse = {
  success: boolean;
  user?: {
    username: string;
  };
  message?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  const username = typeof req.body?.username === "string" ? req.body.username : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!isValidDashboardLogin(username, password)) {
    return res.status(401).json({
      success: false,
      message: "Identifiants invalides.",
    });
  }

  try {
    setDashboardSessionCookie(res, username.trim());
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Configuration d’authentification invalide.",
    });
  }

  return res.status(200).json({
    success: true,
    user: {
      username: username.trim(),
    },
  });
}
