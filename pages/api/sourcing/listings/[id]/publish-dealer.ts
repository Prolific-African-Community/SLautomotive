import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, publishListingToDealer } from "../../../../../lib/dealer";
import { requireDashboardAuth } from "../../../../../lib/simple-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid listing id.",
    });
  }

  const auth = requireDashboardAuth(req, res);
  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  const result = await publishListingToDealer(id);
  return res.status(result.status).json(result.body);
}
