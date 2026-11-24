export type RouteEdgeId = string | number;

export interface ExportRequest {
  method: 'POST';
  headers: {
    'Content-Type': 'application/json';
    Accept: string;
  };
  body: string;
}

function buildExportRequest(
  body: Record<string, unknown>,
  accept = 'application/json',
): ExportRequest {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: accept,
    },
    body: JSON.stringify(body),
  };
}

export function buildMapsExportRequest(
  edgeIds: readonly RouteEdgeId[],
): ExportRequest {
  return buildExportRequest({ edge_ids: edgeIds });
}

export function buildGpxExportRequest(
  edgeIds: readonly RouteEdgeId[],
  durationMinutes: number,
): ExportRequest {
  return buildExportRequest({
    edge_ids: edgeIds,
    name: `Sunday Drive ${durationMinutes} min`,
  }, 'application/gpx+xml, application/octet-stream');
}

export function hasExportableEdges(
  edgeIds: readonly RouteEdgeId[] | null | undefined,
): boolean {
  return Array.isArray(edgeIds) && edgeIds.length > 0;
}

export function getExportErrorDetail(payload: unknown): string | null {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'detail' in payload &&
    typeof payload.detail === 'string'
  ) {
    return payload.detail;
  }
  return null;
}
