import type { NextApiRequest, NextApiResponse } from "next";
import { clearDashboardSessionCookie } from "../../../lib/simple-auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  clearDashboardSessionCookie(res);

  return res.status(200).json({
    success: true,
  });
}
