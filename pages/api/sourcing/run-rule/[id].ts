import type { NextApiRequest, NextApiResponse } from "next";
import * as cheerio from "cheerio";
import { prisma } from "../../../../lib/prisma";
import { requireDashboardAuth } from "../../../../lib/simple-auth";

type SourceName = "luxauto" | "mobile" | "autoscout";

type ExtractedListing = {
  source: SourceName;
  sourceUrl: string;
  externalId: string | null;
  brand: string;
  model: string;
  title: string | null;
  year: number | null;
  mileage: number | null;
  price: number | null;
  currency: string;
  fuel: string | null;
  imageUrl: string | null;
  location: string | null;
  country: string | null;
};

type SourcingRuleForRunner = {
  id: string;
  brand: string;
  model: string;
  yearMin: number | null;
  yearMax: number | null;
  priceMax: number | null;
  mileageMax: number | null;
  countries: string[];
  sources: string[];
  isActive: boolean;
};

const SUPPORTED_SOURCES: SourceName[] = ["luxauto", "mobile", "autoscout"];

const MOBILE_DE_MODEL_MAP: Record<string, string> = {
  "BMW:X3": "3500;48;;",
  "AUDI:A5": "1900;31;;;",
  "AUDI:Q3": "1900;28;;;",
  "PORSCHE:MACAN": "20100;28;;;",
  "MERCEDES:GLC": "17200;117;;;",
  "MERCEDES-BENZ:GLC": "17200;117;;;",
};

const AUTOSCOUT_COUNTRY_CODES: Record<string, string> = {
  DE: "D",
  AT: "A",
  BE: "B",
  ES: "E",
  FR: "F",
  IT: "I",
  LU: "L",
  NL: "NL",
};

const AUTOSCOUT_DEFAULT_EUROPE = ["DE", "AT", "BE", "ES", "FR", "IT", "LU", "NL"];

/* ----------------------------- NORMALIZATION ----------------------------- */

function normalizeText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\u202f/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePath(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeKey(value: string) {
  return value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

function absolutizeUrl(value: string | null | undefined, baseUrl: string) {
  if (!value) return null;

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return value;
  }
}

/* -------------------------------- PARSERS -------------------------------- */

function parsePrice(text: string): number | null {
  const normalized = normalizeText(text);

  const patterns = [
    /(?:pour|prix|price|preis)\s*:?\s*([\d\s.,]+)\s*€/i,
    /€\s*([\d\s.,]+)/i,
    /([\d\s.,]+)\s*€/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);

    if (!match?.[1]) continue;

    const cleaned = match[1].replace(/[^\d]/g, "");
    const value = Number(cleaned);

    if (Number.isFinite(value) && value > 500 && value < 500000) {
      return value;
    }
  }

  return null;
}

function parseMileage(text: string): number | null {
  const normalized = normalizeText(text);

  const patterns = [
    /([\d\s.,]+)\s*km/i,
    /kilom[eè]trage\s*:?\s*([\d\s.,]+)/i,
    /laufleistung\s*:?\s*([\d\s.,]+)/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);

    if (!match?.[1]) continue;

    const cleaned = match[1].replace(/[^\d]/g, "");
    const value = Number(cleaned);

    if (Number.isFinite(value) && value >= 0 && value < 1000000) {
      return value;
    }
  }

  return null;
}

function parseYear(text: string): number | null {
  const match = text.match(/\b(19|20)\d{2}\b/);
  if (!match) return null;

  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

function parseYearFromRegistration(value?: string | null) {
  if (!value) return null;

  const match = value.match(/(?:\d{1,2}[-/.])?((19|20)\d{2})/);
  if (!match?.[1]) return null;

  const year = Number(match[1]);
  return Number.isFinite(year) ? year : null;
}

function detectFuel(text: string): string | null {
  const lower = text.toLowerCase();

  if (lower.includes("diesel")) return "Diesel";

  if (
    lower.includes("essence") ||
    lower.includes("benzin") ||
    lower.includes("petrol")
  ) {
    return "Essence";
  }

  if (
    lower.includes("hybride") ||
    lower.includes("hybrid") ||
    lower.includes("electrique/essence") ||
    lower.includes("électrique/essence")
  ) {
    return "Hybride";
  }

  if (
    lower.includes("electric") ||
    lower.includes("électrique") ||
    lower.includes("electrique") ||
    lower.includes("elektro")
  ) {
    return "Électrique";
  }

  return null;
}

/* ---------------------------------- URLS ---------------------------------- */

function getMobileModelCode(rule: SourcingRuleForRunner) {
  const brand = normalizeKey(rule.brand);
  const model = normalizeKey(rule.model);

  const directKey = `${brand}:${model}`;
  const mercedesAliasKey = `${brand.replace("MERCEDES-BENZ", "MERCEDES")}:${model}`;

  return MOBILE_DE_MODEL_MAP[directKey] || MOBILE_DE_MODEL_MAP[mercedesAliasKey] || null;
}

function buildLuxautoUrl(rule: SourcingRuleForRunner) {
  const brand = normalizePath(rule.brand);
  const model = normalizePath(rule.model);

  const params = new URLSearchParams();

  params.set("page", "1");
  params.set("size", "20");

  if (rule.yearMin) params.set("minYear", String(rule.yearMin));
  if (rule.yearMax) params.set("maxYear", String(rule.yearMax));
  if (rule.mileageMax) params.set("maxMileage", String(rule.mileageMax));
  if (rule.priceMax) params.set("maxPrice", String(rule.priceMax));

  return `https://www.luxauto.lu/fr/sale/voiture/${encodeURIComponent(
    brand
  )}/${encodeURIComponent(model)}?${params.toString()}`;
}

function buildMobileUrl(rule: SourcingRuleForRunner) {
  const mobileCode = getMobileModelCode(rule);

  if (!mobileCode) {
    throw new Error(
      `Mobile.de model mapping missing for ${rule.brand} ${rule.model}. Add it to MOBILE_DE_MODEL_MAP.`
    );
  }

  const params = new URLSearchParams();

  params.set("dam", "false");
  params.set("isSearchRequest", "true");
  params.set("s", "Car");
  params.set("vc", "Car");
  params.set("ms", mobileCode);
  params.set("od", "up");
  params.set("sb", "rel");
  params.set("ref", "srp");

  if (rule.yearMin || rule.yearMax) {
    params.set("fr", `${rule.yearMin || ""}:${rule.yearMax || ""}`);
  }

  if (rule.mileageMax) {
    params.set("ml", `:${rule.mileageMax}`);
  }

  if (rule.priceMax) {
    params.set("p", `:${rule.priceMax}`);
  }

  return `https://suchen.mobile.de/fahrzeuge/search.html?${params.toString()}`;
}

function buildAutoscoutUrl(rule: SourcingRuleForRunner) {
  const brand = normalizePath(rule.brand);
  const model = normalizePath(rule.model);

  const selectedCountries =
    Array.isArray(rule.countries) && rule.countries.length > 0
      ? rule.countries
      : AUTOSCOUT_DEFAULT_EUROPE;

  const autoscoutCountries = selectedCountries
    .map((country) => AUTOSCOUT_COUNTRY_CODES[country.toUpperCase()])
    .filter(Boolean);

  const params = new URLSearchParams();

  params.set("atype", "C");
  params.set(
    "cy",
    autoscoutCountries.length > 0
      ? autoscoutCountries.join(",")
      : AUTOSCOUT_DEFAULT_EUROPE.map((country) => AUTOSCOUT_COUNTRY_CODES[country]).join(",")
  );

  params.set("damaged_listing", "exclude");
  params.set("desc", "0");
  params.set("powertype", "kw");
  params.set("sort", "standard");
  params.set("source", "detailsearch");
  params.set("ustate", "N,U");

  if (rule.yearMin) params.set("fregfrom", String(rule.yearMin));
  if (rule.yearMax) params.set("fregto", String(rule.yearMax));
  if (rule.mileageMax) params.set("kmto", String(rule.mileageMax));
  if (rule.priceMax) params.set("priceto", String(rule.priceMax));

  return `https://www.autoscout24.fr/lst/${encodeURIComponent(
    brand
  )}/${encodeURIComponent(model)}?${params.toString()}`;
}

/* ------------------------------ URL DETECTION ----------------------------- */

function isLuxautoListingUrl(href: string) {
  const lower = href.toLowerCase();

  return (
    lower.includes("luxauto.lu/fr/car/") ||
    lower.includes("luxauto.lu/fr/voiture/") ||
    lower.includes("luxauto.lu/en/car/") ||
    lower.includes("luxauto.lu/de/auto/")
  );
}

function isMobileListingUrl(href: string) {
  const lower = href.toLowerCase();

  return (
    lower.includes("suchen.mobile.de/fahrzeuge/details.html") ||
    lower.includes("/fahrzeuge/details.html")
  );
}

function isAutoscoutListingUrl(href: string) {
  const lower = href.toLowerCase();

  return (
    lower.includes("autoscout24.") &&
    lower.includes("/offres/")
  );
}

/* ----------------------------- URL EXTRACTION ----------------------------- */

function extractDataFromLuxautoUrl(url: string) {
  const lower = url.toLowerCase();

  const idMatch = lower.match(/-(\d{6,})(?:\?|#)?$/);

  return {
    year: parseYear(lower),
    fuel: detectFuel(lower),
    externalId: idMatch?.[1] || null,
  };
}

function extractDataFromMobileUrl(url: string) {
  const lower = url.toLowerCase();

  const idMatch =
    lower.match(/[?&]id=(\d+)/i) ||
    lower.match(/details\.html.*?(\d{6,})/i);

  return {
    year: parseYear(lower),
    fuel: detectFuel(lower),
    externalId: idMatch?.[1] || null,
  };
}

function extractDataFromAutoscoutUrl(url: string) {
  const lower = url.toLowerCase();
  const idMatch = lower.match(/-([a-f0-9-]{36})(?:\?|#|$)/i);

  return {
    year: parseYear(lower),
    fuel: detectFuel(lower),
    externalId: idMatch?.[1] || null,
  };
}

/* -------------------------------- FETCHING -------------------------------- */

function sourceReferer(url: string) {
  if (url.includes("mobile.de")) return "https://suchen.mobile.de/";
  if (url.includes("luxauto.lu")) return "https://www.luxauto.lu/";
  if (url.includes("autoscout24.")) return "https://www.autoscout24.fr/";

  return "https://www.google.com/";
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8,de;q=0.7,nl;q=0.6",
      Referer: sourceReferer(url),
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed with status ${response.status} for ${url}`);
  }

  return response.text();
}

function extractJsonFromNextData(html: string) {
  const $ = cheerio.load(html);
  const raw = $("#__NEXT_DATA__").text();

  if (!raw) return "";

  try {
    return JSON.stringify(JSON.parse(raw));
  } catch {
    return raw;
  }
}

function parseNextDataObject(html: string): any | null {
  const $ = cheerio.load(html);
  const raw = $("#__NEXT_DATA__").text();

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* -------------------------------- HELPERS -------------------------------- */

function findImageInContainer(
  container: cheerio.Cheerio<any>,
  baseUrl: string
) {
  const img =
    container.find("img").first().attr("src") ||
    container.find("img").first().attr("data-src") ||
    container.find("img").first().attr("data-lazy-src") ||
    container.find("img").first().attr("srcset")?.split(" ")?.[0] ||
    null;

  return absolutizeUrl(img, baseUrl);
}

function passesRuleFilters(
  listing: ExtractedListing,
  rule: {
    yearMin: number | null;
    yearMax: number | null;
    priceMax: number | null;
    mileageMax: number | null;
  }
) {
  if ((rule.yearMin || rule.yearMax) && !listing.year) return false;

  if (rule.yearMin && listing.year && listing.year < rule.yearMin) return false;
  if (rule.yearMax && listing.year && listing.year > rule.yearMax) return false;

  if (rule.priceMax && listing.price && listing.price > rule.priceMax) {
    return false;
  }

  if (rule.mileageMax && listing.mileage && listing.mileage > rule.mileageMax) {
    return false;
  }

  return true;
}

/* ------------------------------- ENRICHMENT ------------------------------- */

async function enrichLuxautoListingFromDetailPage(listing: ExtractedListing) {
  try {
    const html = await fetchHtml(listing.sourceUrl);
    const $ = cheerio.load(html);

    const metaTitle =
      $('meta[property="og:title"]').attr("content") ||
      $("title").first().text() ||
      "";

    const metaDescription =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    const nextDataText = extractJsonFromNextData(html);
    const pageText = normalizeText($("body").text());

    const combinedText = [
      metaTitle,
      metaDescription,
      pageText,
      nextDataText,
      listing.sourceUrl,
    ]
      .filter(Boolean)
      .join(" ");

    const urlData = extractDataFromLuxautoUrl(listing.sourceUrl);

    return {
      ...listing,
      title: listing.title || metaTitle || `${listing.brand} ${listing.model}`,
      year:
        listing.year ||
        parseYear(metaTitle) ||
        parseYear(metaDescription) ||
        urlData.year ||
        parseYear(pageText) ||
        parseYear(nextDataText) ||
        parseYear(combinedText),
      mileage:
        listing.mileage ||
        parseMileage(metaTitle) ||
        parseMileage(metaDescription) ||
        parseMileage(pageText) ||
        parseMileage(nextDataText) ||
        parseMileage(combinedText),
      price:
        listing.price ||
        parsePrice(metaTitle) ||
        parsePrice(metaDescription) ||
        parsePrice(pageText) ||
        parsePrice(nextDataText) ||
        parsePrice(combinedText),
      fuel:
        listing.fuel ||
        detectFuel(metaTitle) ||
        detectFuel(metaDescription) ||
        urlData.fuel ||
        detectFuel(pageText) ||
        detectFuel(nextDataText) ||
        detectFuel(combinedText),
      imageUrl:
        $('meta[property="og:image"]').attr("content") ||
        listing.imageUrl ||
        null,
      externalId: listing.externalId || urlData.externalId,
    };
  } catch {
    return listing;
  }
}

async function enrichMobileListingFromDetailPage(listing: ExtractedListing) {
  try {
    const html = await fetchHtml(listing.sourceUrl);
    const $ = cheerio.load(html);

    const metaTitle =
      $('meta[property="og:title"]').attr("content") ||
      $("title").first().text() ||
      "";

    const metaDescription =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    const pageText = normalizeText($("body").text());
    const combinedText = [metaTitle, metaDescription, pageText, listing.sourceUrl]
      .filter(Boolean)
      .join(" ");

    const urlData = extractDataFromMobileUrl(listing.sourceUrl);

    return {
      ...listing,
      title: listing.title || metaTitle || `${listing.brand} ${listing.model}`,
      year:
        listing.year ||
        parseYear(metaTitle) ||
        parseYear(metaDescription) ||
        urlData.year ||
        parseYear(pageText) ||
        parseYear(combinedText),
      mileage:
        listing.mileage ||
        parseMileage(metaTitle) ||
        parseMileage(metaDescription) ||
        parseMileage(pageText) ||
        parseMileage(combinedText),
      price:
        listing.price ||
        parsePrice(metaTitle) ||
        parsePrice(metaDescription) ||
        parsePrice(pageText) ||
        parsePrice(combinedText),
      fuel:
        listing.fuel ||
        detectFuel(metaTitle) ||
        detectFuel(metaDescription) ||
        urlData.fuel ||
        detectFuel(pageText) ||
        detectFuel(combinedText),
      imageUrl:
        $('meta[property="og:image"]').attr("content") ||
        listing.imageUrl ||
        null,
      externalId: listing.externalId || urlData.externalId,
    };
  } catch {
    return listing;
  }
}

async function enrichListingFromDetailPage(listing: ExtractedListing) {
  if (listing.source === "luxauto") return enrichLuxautoListingFromDetailPage(listing);
  if (listing.source === "mobile") return enrichMobileListingFromDetailPage(listing);

  return listing;
}

/* ------------------------------ LUXAUTO SCRAPE ---------------------------- */

function extractLuxautoJsonLdListings(params: {
  html: string;
  searchUrl: string;
  brand: string;
  model: string;
}) {
  const { html, searchUrl, brand, model } = params;
  const $ = cheerio.load(html);

  const results: ExtractedListing[] = [];
  const seen = new Set<string>();

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of items) {
        const candidates = [
          item,
          ...(Array.isArray(item?.itemListElement)
            ? item.itemListElement.map((x: any) => x.item || x)
            : []),
        ];

        for (const candidate of candidates) {
          const url =
            candidate?.url ||
            candidate?.offers?.url ||
            candidate?.mainEntityOfPage;

          const absoluteUrl = absolutizeUrl(url, searchUrl);

          if (!absoluteUrl || !isLuxautoListingUrl(absoluteUrl)) continue;
          if (seen.has(absoluteUrl)) continue;

          const urlData = extractDataFromLuxautoUrl(absoluteUrl);

          const name =
            candidate?.name ||
            candidate?.headline ||
            candidate?.description ||
            `${brand} ${model}`;

          const text = `${name} ${candidate?.description || ""} ${absoluteUrl}`;

          if (
            !text.toLowerCase().includes(model.toLowerCase()) &&
            !absoluteUrl.toLowerCase().includes(model.toLowerCase())
          ) {
            continue;
          }

          const imageRaw = Array.isArray(candidate?.image)
            ? candidate.image[0]
            : candidate?.image;

          const price =
            candidate?.offers?.price != null
              ? Number(candidate.offers.price)
              : parsePrice(text);

          results.push({
            source: "luxauto",
            sourceUrl: absoluteUrl,
            externalId: urlData.externalId,
            brand,
            model,
            title: String(name).trim(),
            year: parseYear(text) || urlData.year,
            mileage: parseMileage(text),
            price: Number.isFinite(price) ? price : null,
            currency: candidate?.offers?.priceCurrency || "EUR",
            fuel: detectFuel(text) || urlData.fuel,
            imageUrl: absolutizeUrl(imageRaw, searchUrl),
            location: "Luxembourg / Grande Région",
            country: "LU",
          });

          seen.add(absoluteUrl);
        }
      }
    } catch {
      return;
    }
  });

  return results;
}

function extractLuxautoListings(params: {
  html: string;
  searchUrl: string;
  brand: string;
  model: string;
}) {
  const { html, searchUrl, brand, model } = params;
  const $ = cheerio.load(html);

  const results: ExtractedListing[] = [];
  const seen = new Set<string>();

  for (const item of extractLuxautoJsonLdListings(params)) {
    if (!seen.has(item.sourceUrl)) {
      results.push(item);
      seen.add(item.sourceUrl);
    }
  }

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const absoluteUrl = absolutizeUrl(href, searchUrl);
    if (!absoluteUrl || !isLuxautoListingUrl(absoluteUrl)) return;
    if (seen.has(absoluteUrl)) return;

    const urlData = extractDataFromLuxautoUrl(absoluteUrl);

    const container =
      $(el).closest("article").first().length > 0
        ? $(el).closest("article").first()
        : $(el).closest("li").first().length > 0
        ? $(el).closest("li").first()
        : $(el).closest("div").first();

    const rawText = normalizeText(container.text()) || normalizeText($(el).text());
    const combinedText = `${rawText} ${absoluteUrl}`;

    if (
      !combinedText.toLowerCase().includes(model.toLowerCase()) &&
      !absoluteUrl.toLowerCase().includes(model.toLowerCase())
    ) {
      return;
    }

    const title =
      $(el).attr("title")?.trim() ||
      normalizeText(container.find("h1,h2,h3,h4").first().text()) ||
      `${brand} ${model}`;

    results.push({
      source: "luxauto",
      sourceUrl: absoluteUrl,
      externalId: urlData.externalId,
      brand,
      model,
      title,
      year: parseYear(rawText) || urlData.year,
      mileage: parseMileage(rawText),
      price: parsePrice(rawText),
      currency: "EUR",
      fuel: detectFuel(rawText) || urlData.fuel,
      imageUrl: findImageInContainer(container, searchUrl),
      location: "Luxembourg / Grande Région",
      country: "LU",
    });

    seen.add(absoluteUrl);
  });

  return results.slice(0, 30);
}

/* ------------------------------- MOBILE SCRAPE ---------------------------- */

function extractMobileListings(params: {
  html: string;
  searchUrl: string;
  brand: string;
  model: string;
}) {
  const { html, searchUrl, brand, model } = params;
  const $ = cheerio.load(html);

  const results: ExtractedListing[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const absoluteUrl = absolutizeUrl(href, searchUrl);
    if (!absoluteUrl || !isMobileListingUrl(absoluteUrl)) return;
    if (seen.has(absoluteUrl)) return;

    const urlData = extractDataFromMobileUrl(absoluteUrl);

    const container =
      $(el).closest("article").first().length > 0
        ? $(el).closest("article").first()
        : $(el).closest("[data-testid]").first().length > 0
        ? $(el).closest("[data-testid]").first()
        : $(el).closest("div").first();

    const rawText = normalizeText(container.text()) || normalizeText($(el).text());
    const combinedText = `${rawText} ${absoluteUrl}`;

    if (
      !combinedText.toLowerCase().includes(model.toLowerCase()) &&
      !absoluteUrl.toLowerCase().includes(model.toLowerCase())
    ) {
      return;
    }

    const title =
      $(el).attr("title")?.trim() ||
      normalizeText(container.find("h1,h2,h3,h4").first().text()) ||
      `${brand} ${model}`;

    results.push({
      source: "mobile",
      sourceUrl: absoluteUrl,
      externalId: urlData.externalId,
      brand,
      model,
      title,
      year: parseYear(rawText) || urlData.year,
      mileage: parseMileage(rawText),
      price: parsePrice(rawText),
      currency: "EUR",
      fuel: detectFuel(rawText) || urlData.fuel,
      imageUrl: findImageInContainer(container, searchUrl),
      location: "Allemagne",
      country: "DE",
    });

    seen.add(absoluteUrl);
  });

  return results.slice(0, 30);
}

/* ----------------------------- AUTOSCOUT SCRAPE --------------------------- */

function findAutoscoutListingsInObject(value: any): any[] {
  const results: any[] = [];
  const seen = new Set<string>();

  function walk(node: any) {
    if (!node || typeof node !== "object") return;

    if (
      typeof node.id === "string" &&
      node.vehicle &&
      node.price &&
      node.url &&
      !seen.has(node.id)
    ) {
      results.push(node);
      seen.add(node.id);
    }

    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    for (const key of Object.keys(node)) {
      walk(node[key]);
    }
  }

  walk(value);

  return results;
}

function extractAutoscoutListings(params: {
  html: string;
  searchUrl: string;
  brand: string;
  model: string;
}) {
  const { html, searchUrl, brand, model } = params;

  const nextData = parseNextDataObject(html);
  const records = nextData ? findAutoscoutListingsInObject(nextData) : [];

  const results: ExtractedListing[] = [];
  const seen = new Set<string>();

  for (const record of records) {
    const vehicle = record.vehicle || {};
    const location = record.location || {};
    const tracking = record.tracking || {};

    const sourceUrl = absolutizeUrl(record.url, searchUrl);
    if (!sourceUrl || !isAutoscoutListingUrl(sourceUrl)) continue;
    if (seen.has(sourceUrl)) continue;

    const sourceBrand = vehicle.make || brand;
    const sourceModel = vehicle.model || vehicle.modelGroup || model;

    const text = [
      sourceBrand,
      sourceModel,
      vehicle.modelVersionInput,
      vehicle.fuel,
      vehicle.transmission,
      vehicle.mileageInKm,
      record.price?.priceFormatted,
      tracking.firstRegistration,
      tracking.price,
      tracking.mileage,
      sourceUrl,
    ]
      .filter(Boolean)
      .join(" ");

    if (
      !text.toLowerCase().includes(model.toLowerCase()) &&
      !sourceUrl.toLowerCase().includes(model.toLowerCase())
    ) {
      continue;
    }

    const urlData = extractDataFromAutoscoutUrl(sourceUrl);

    const price =
      tracking.price != null
        ? Number(tracking.price)
        : parsePrice(record.price?.priceFormatted || text);

    const mileage =
      tracking.mileage != null
        ? Number(tracking.mileage)
        : parseMileage(vehicle.mileageInKm || text);

    const year =
      parseYearFromRegistration(tracking.firstRegistration) ||
      parseYearFromRegistration(
        Array.isArray(record.vehicleDetails)
          ? record.vehicleDetails.find((x: any) => x?.iconName === "calendar")?.data
          : null
      ) ||
      parseYear(text) ||
      urlData.year;

    const fuel = vehicle.fuel || detectFuel(text) || urlData.fuel;

    const title = normalizeText(
      `${sourceBrand} ${sourceModel} ${vehicle.modelVersionInput || ""}`
    );

    const city = location.city || null;
    const country = location.countryCode || "BE";

    results.push({
      source: "autoscout",
      sourceUrl,
      externalId: record.id || urlData.externalId,
      brand: sourceBrand,
      model: sourceModel,
      title: title || `${brand} ${model}`,
      year,
      mileage: Number.isFinite(mileage) ? mileage : null,
      price: Number.isFinite(price) ? price : null,
      currency: "EUR",
      fuel,
      imageUrl: Array.isArray(record.images) ? record.images[0] || null : null,
      location: city ? `${city}, ${country}` : country,
      country,
    });

    seen.add(sourceUrl);
  }

  return results.slice(0, 30);
}

/* ------------------------------- DEBUG LINKS ------------------------------ */

function extractDebugLinks(html: string, searchUrl: string) {
  const $ = cheerio.load(html);
  const links: string[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const absoluteUrl = absolutizeUrl(href, searchUrl);
    if (!absoluteUrl) return;

    if (!links.includes(absoluteUrl) && links.length < 50) {
      links.push(absoluteUrl);
    }
  });

  return links;
}

/* ------------------------------- EXTRACTION ------------------------------- */

async function extractFromSource(params: {
  source: SourceName;
  rule: SourcingRuleForRunner;
}) {
  const { source, rule } = params;

  if (source === "luxauto") {
    const searchUrl = buildLuxautoUrl(rule);
    const html = await fetchHtml(searchUrl);

    return {
      source,
      searchUrl,
      html,
      rawExtracted: extractLuxautoListings({
        html,
        searchUrl,
        brand: rule.brand,
        model: rule.model,
      }),
    };
  }

  if (source === "mobile") {
    const searchUrl = buildMobileUrl(rule);
    const html = await fetchHtml(searchUrl);

    return {
      source,
      searchUrl,
      html,
      rawExtracted: extractMobileListings({
        html,
        searchUrl,
        brand: rule.brand,
        model: rule.model,
      }),
    };
  }

  const searchUrl = buildAutoscoutUrl(rule);
  const html = await fetchHtml(searchUrl);

  return {
    source,
    searchUrl,
    html,
    rawExtracted: extractAutoscoutListings({
      html,
      searchUrl,
      brand: rule.brand,
      model: rule.model,
    }),
  };
}

/* -------------------------------- HANDLER -------------------------------- */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = requireDashboardAuth(req, res);
  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid rule id.",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  try {
    const rule = await prisma.sourcingRule.findUnique({
      where: { id },
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Rule not found.",
      });
    }

    if (!rule.isActive) {
      return res.status(400).json({
        success: false,
        message: "Rule is inactive.",
      });
    }

    const runnerRule = rule as SourcingRuleForRunner;

    const enabledSources = runnerRule.sources
      .map((source) => source.trim().toLowerCase())
      .filter((source): source is SourceName =>
        SUPPORTED_SOURCES.includes(source as SourceName)
      );

    if (enabledSources.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No supported source found. Use luxauto, mobile and/or autoscout.",
      });
    }

    const sourceResults: any[] = [];
    const rawExtracted: ExtractedListing[] = [];

    for (const source of enabledSources) {
      try {
        const result = await extractFromSource({
          source,
          rule: runnerRule,
        });

        rawExtracted.push(...result.rawExtracted);

        sourceResults.push({
          source: result.source,
          searchUrl: result.searchUrl,
          rawExtractedCount: result.rawExtracted.length,
          htmlLength: result.html.length,
          sampleLinks:
            result.rawExtracted.length === 0
              ? extractDebugLinks(result.html, result.searchUrl)
              : undefined,
        });
      } catch (error: any) {
        let searchUrl: string | null = null;

        try {
          if (source === "luxauto") searchUrl = buildLuxautoUrl(runnerRule);
          if (source === "mobile") searchUrl = buildMobileUrl(runnerRule);
          if (source === "autoscout") searchUrl = buildAutoscoutUrl(runnerRule);
        } catch {
          searchUrl = null;
        }

        sourceResults.push({
          source,
          searchUrl,
          rawExtractedCount: 0,
          error: error?.message || "source failed",
        });
      }
    }

    const uniqueRawExtractedMap = new Map<string, ExtractedListing>();

    for (const listing of rawExtracted) {
      uniqueRawExtractedMap.set(listing.sourceUrl, listing);
    }

    const uniqueRawExtracted = Array.from(uniqueRawExtractedMap.values());

    const enrichedRawExtracted: ExtractedListing[] = [];

    for (const listing of uniqueRawExtracted) {
      const enriched =
        listing.source === "autoscout"
          ? listing
          : await enrichListingFromDetailPage(listing);

      enrichedRawExtracted.push(enriched);
    }

    const extracted = enrichedRawExtracted.filter((listing) =>
      passesRuleFilters(listing, {
        yearMin: runnerRule.yearMin,
        yearMax: runnerRule.yearMax,
        priceMax: runnerRule.priceMax,
        mileageMax: runnerRule.mileageMax,
      })
    );

    const created = [];
    const skipped = [];

    for (const listing of extracted) {
      try {
        const record = await prisma.vehicleListing.create({
          data: {
            source: listing.source,
            sourceUrl: listing.sourceUrl,
            externalId: listing.externalId,
            brand: listing.brand,
            model: listing.model,
            title: listing.title,
            year: listing.year,
            mileage: listing.mileage,
            price: listing.price,
            currency: listing.currency,
            fuel: listing.fuel,
            location: listing.location,
            country: listing.country,
            imageUrl: listing.imageUrl,
            sourcingRuleId: runnerRule.id,
            lastSeenAt: new Date(),
            lastCheckedAt: new Date(),
            isActive: true,
            analysis: {
              create: {},
            },
          },
          include: {
            analysis: true,
            sourcingRule: true,
          },
        });

        created.push(record);
      } catch (error: any) {
        if (error?.code === "P2002") {
          const updated = await prisma.vehicleListing.updateMany({
            where: {
              sourceUrl: listing.sourceUrl,
            },
            data: {
              source: listing.source,
              externalId: listing.externalId,
              title: listing.title,
              year: listing.year,
              mileage: listing.mileage,
              price: listing.price,
              currency: listing.currency,
              fuel: listing.fuel,
              imageUrl: listing.imageUrl,
              location: listing.location,
              country: listing.country,
              lastSeenAt: new Date(),
              lastCheckedAt: new Date(),
              isActive: true,
              sourcingRuleId: runnerRule.id,
            },
          });

          skipped.push({
            sourceUrl: listing.sourceUrl,
            source: listing.source,
            reason: "duplicate-updated",
            updatedCount: updated.count,
            price: listing.price,
            year: listing.year,
            mileage: listing.mileage,
          });

          continue;
        }

        skipped.push({
          sourceUrl: listing.sourceUrl,
          source: listing.source,
          reason: error?.message || "unknown error",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        rule: runnerRule,
        sources: enabledSources,
        sourceResults,
        rawExtractedCount: rawExtracted.length,
        uniqueRawExtractedCount: uniqueRawExtracted.length,
        enrichedRawExtractedCount: enrichedRawExtracted.length,
        extractedCount: extracted.length,
        createdCount: created.length,
        skippedCount: skipped.length,
        created,
        skipped,
        debug: {
          sampleExtracted: extracted.slice(0, 5).map((item) => ({
            source: item.source,
            sourceUrl: item.sourceUrl,
            title: item.title,
            year: item.year,
            mileage: item.mileage,
            price: item.price,
            fuel: item.fuel,
            imageUrl: item.imageUrl,
            location: item.location,
            country: item.country,
          })),
        },
      },
    });
  } catch (error: any) {
    console.error("POST /api/sourcing/run-rule/[id] error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to run sourcing rule.",
      error: {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
      },
    });
  }
}
