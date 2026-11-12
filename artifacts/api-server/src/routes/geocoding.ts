import { Router, type IRouter } from "express";
import {
  GetGeocodingSuggestionsQueryParams,
  GetGeocodingSuggestionsResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const CALIFORNIA_BOUNDS = {
  west: -124.48,
  south: 32.53,
  east: -114.13,
  north: 42.01,
};
const NON_CALIFORNIA_STATE_CODES = new Set([
  "AL", "AK", "AZ", "AR", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
  "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR",
  "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI",
  "WY", "DC",
]);
const NON_CALIFORNIA_STATE_NAMES = new Set([
  "alabama", "alaska", "arizona", "arkansas", "colorado", "connecticut",
  "delaware", "florida", "georgia", "hawaii", "idaho", "illinois", "indiana",
  "iowa", "kansas", "kentucky", "louisiana", "maine", "maryland",
  "massachusetts", "michigan", "minnesota", "mississippi", "missouri",
  "montana", "nebraska", "nevada", "new hampshire", "new jersey", "new mexico",
  "new york", "north carolina", "north dakota", "ohio", "oklahoma", "oregon",
  "pennsylvania", "rhode island", "south carolina", "south dakota",
  "tennessee", "texas", "utah", "vermont", "virginia", "washington",
  "west virginia", "wisconsin", "wyoming", "district of columbia",
]);

interface GeoapifyFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    place_id?: string;
    name?: string;
    address_line1?: string;
    address_line2?: string;
    formatted?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    lat?: number;
    lon?: number;
    state_code?: string;
    country_code?: string;
  };
}

function isCaliforniaFeature(feature: GeoapifyFeature): boolean {
  const properties = feature.properties;
  const latitude = properties?.lat ?? feature.geometry?.coordinates?.[1];
  const longitude = properties?.lon ?? feature.geometry?.coordinates?.[0];

  // The provider filter narrows the search; this second check fails closed if
  // a result is missing its California state code or falls outside the bounds.
  return (
    properties?.state_code?.toUpperCase() === "CA" &&
    properties.country_code?.toLowerCase() === "us" &&
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    latitude >= CALIFORNIA_BOUNDS.south &&
    latitude <= CALIFORNIA_BOUNDS.north &&
    longitude >= CALIFORNIA_BOUNDS.west &&
    longitude <= CALIFORNIA_BOUNDS.east
  );
}

function explicitlyRequestsAnotherState(query: string): boolean {
  const finalPart = query.trim().split(",").at(-1)?.trim() ?? "";
  const abbreviation = finalPart.match(/^([a-z]{2})(?:\s+\d{5})?$/i)?.[1];
  return (
    (abbreviation !== undefined &&
      NON_CALIFORNIA_STATE_CODES.has(abbreviation.toUpperCase())) ||
    NON_CALIFORNIA_STATE_NAMES.has(finalPart.toLowerCase())
  );
}

function toSuggestion(feature: GeoapifyFeature) {
  const properties = feature.properties;
  if (!properties) return null;
  const coordinates = feature.geometry?.coordinates;
  const latitude = properties.lat ?? coordinates?.[1];
  const longitude = properties.lon ?? coordinates?.[0];
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  const title = properties.name || properties.address_line1 || properties.formatted;
  if (!title) return null;

  const contextParts = [
    properties.address_line1 !== title ? properties.address_line1 : undefined,
    properties.suburb,
    properties.city,
    properties.state,
    properties.postcode,
    properties.country,
  ].filter((part): part is string => Boolean(part));
  const context = contextParts
    .filter(
      (part, index, parts) =>
        parts.findIndex(
          (candidate) =>
            candidate.toLocaleLowerCase() === part.toLocaleLowerCase(),
        ) === index,
    )
    .join(", ");

  const id = properties.place_id || `${latitude},${longitude},${title}`;

  return {
    id,
    title,
    context,
    label: properties.formatted || [title, context].filter(Boolean).join(", "),
    latitude,
    longitude,
  };
}

router.get("/geocoding/suggestions", async (req, res) => {
  const parsed = GetGeocodingSuggestionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter at least 3 characters to search." });
    return;
  }
  if (explicitlyRequestsAnotherState(parsed.data.q)) {
    res.json(GetGeocodingSuggestionsResponse.parse({ suggestions: [] }));
    return;
  }

  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Location search is not configured yet." });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const searchUrl = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
    searchUrl.searchParams.set("text", parsed.data.q);
    searchUrl.searchParams.set("limit", String(parsed.data.limit));
    searchUrl.searchParams.set("lang", "en");
    searchUrl.searchParams.set(
      "filter",
      `rect:${CALIFORNIA_BOUNDS.west},${CALIFORNIA_BOUNDS.south},${CALIFORNIA_BOUNDS.east},${CALIFORNIA_BOUNDS.north}|countrycode:us`,
    );
    searchUrl.searchParams.set("apiKey", apiKey);

    const response = await fetch(searchUrl, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      logger.warn({ status: response.status }, "Geocoding provider unavailable");
      res.status(502).json({ error: "Location search is temporarily unavailable." });
      return;
    }

    const payload = (await response.json()) as {
      features?: GeoapifyFeature[];
    };
    const suggestions = (payload.features ?? [])
      .filter(isCaliforniaFeature)
      .map(toSuggestion)
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, parsed.data.limit);

    res.json(GetGeocodingSuggestionsResponse.parse({ suggestions }));
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    logger.warn(
      { error: error instanceof Error ? error.message : "Unknown error" },
      "Location search request failed",
    );
    res
      .status(timedOut ? 504 : 502)
      .json({ error: "Location search is temporarily unavailable." });
  } finally {
    clearTimeout(timeout);
  }
});

export default router;
