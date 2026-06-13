import type { NextApiRequest, NextApiResponse } from "next";
import { ApiResponse, publishListingToDealer } from "../../../../../lib/dealer";

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

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  const result = await publishListingToDealer(id);
  return res.status(result.status).json(result.body);
}
