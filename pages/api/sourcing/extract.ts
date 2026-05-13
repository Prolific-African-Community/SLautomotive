import type { NextApiRequest, NextApiResponse } from "next";
import * as cheerio from "cheerio";

type ApiResponse =
  | {
      success: true;
      data: {
        sourceUrl: string;
        source: string;
        title: string | null;
        imageUrl: string | null;
        description: string | null;
      };
    }
  | {
      success: false;
      message: string;
      error?: any;
    };

function detectSource(url: string) {
  const lower = url.toLowerCase();

  if (lower.includes("luxauto")) return "luxauto";
  if (lower.includes("autoscout24")) return "autoscout";
  if (lower.includes("mobile.de")) return "mobile";
  if (lower.includes("leboncoin")) return "leboncoin";

  return "unknown";
}

function clean(value?: string | null) {
  if (!value) return null;
  return value.replace(/\s+/g, " ").trim() || null;
}

function absolutizeUrl(value: string | null, baseUrl: string) {
  if (!value) return null;

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return value;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  try {
    const { sourceUrl } = req.body;

    if (!sourceUrl || typeof sourceUrl !== "string") {
      return res.status(400).json({
        success: false,
        message: "sourceUrl is required.",
      });
    }

    let url: URL;

    try {
      url = new URL(sourceUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid URL.",
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: `Failed to fetch listing page. Status: ${response.status}`,
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      clean($('meta[property="og:title"]').attr("content")) ||
      clean($('meta[name="twitter:title"]').attr("content")) ||
      clean($("title").first().text());

    const description =
      clean($('meta[property="og:description"]').attr("content")) ||
      clean($('meta[name="description"]').attr("content")) ||
      clean($('meta[name="twitter:description"]').attr("content"));

    const imageRaw =
      clean($('meta[property="og:image"]').attr("content")) ||
      clean($('meta[name="twitter:image"]').attr("content")) ||
      clean($("img").first().attr("src"));

    const imageUrl = absolutizeUrl(imageRaw, url.toString());

    return res.status(200).json({
      success: true,
      data: {
        sourceUrl: url.toString(),
        source: detectSource(url.toString()),
        title,
        imageUrl,
        description,
      },
    });
  } catch (error: any) {
    console.error("POST /api/sourcing/extract error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to extract listing data.",
      error: {
        name: error?.name,
        message: error?.message,
        code: error?.code,
      },
    });
  }
}