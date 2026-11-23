import type { HistoricalMapSnapshot } from "@/types/series";

/** 传入客户端组件前把重几何数据置空，改由 /api/map-geo/<id> 按需拉取。 */
const EMPTY_POLYGON = { type: "Polygon" as const, coordinates: [] as number[][][] };

export type SlimSnapshot = HistoricalMapSnapshot & { geometryUrl?: string };

export function slimSnapshot(snapshot: HistoricalMapSnapshot): SlimSnapshot {
  return {
    ...snapshot,
    regions: snapshot.regions.map((region) => ({
      ...region,
      geometry: EMPTY_POLYGON,
      fillBands: undefined,
    })) as unknown as HistoricalMapSnapshot["regions"],
    outlines: {},
    reconstructedOutlines: {},
    geometryUrl: `/api/map-geo/${encodeURIComponent(snapshot.id)}`,
  };
}

export function isGeometryMissing(snapshot: HistoricalMapSnapshot): boolean {
  return snapshot.regions.every((region) => {
    const coords = (region.geometry as { coordinates?: unknown[] } | undefined)?.coordinates;
    return !coords || coords.length === 0;
  });
}
