import type { NextApiRequest, NextApiResponse } from "next";
import { requireDashboardAuth } from "../../../lib/simple-auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  const auth = requireDashboardAuth(req, res);
  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  return res.status(200).json({
    success: true,
    user: {
      username: auth.session.username,
    },
  });
}
