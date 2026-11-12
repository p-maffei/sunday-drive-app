import { Router, type IRouter } from "express";
import {
  GetGeocodingSuggestionsQueryParams,
  GetGeocodingSuggestionsResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();
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
    lat?: number;
    lon?: number;
  };
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

  const context =
    properties.address_line2 ||
    [properties.suburb, properties.city, properties.state, properties.postcode]
      .filter((part, index, parts): part is string =>
        Boolean(part) && parts.indexOf(part) === index,
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
