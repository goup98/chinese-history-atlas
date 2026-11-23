import { NextResponse } from "next/server";
import { historySeries } from "@/data/series";
import { getSeriesRepository } from "@/lib/repositories/series-repository";
import type { HistoricalMapSnapshot, SnapshotRegion } from "@/types/series";

export const revalidate = 3600;

type GeoPayload = {
  regions: Record<string, { geometry: SnapshotRegion["geometry"]; fillBands?: SnapshotRegion["fillBands"] }>;
  outlines?: HistoricalMapSnapshot["outlines"];
  reconstructedOutlines?: HistoricalMapSnapshot["reconstructedOutlines"];
};

let cache: Map<string, GeoPayload> | undefined;

async function buildCache(): Promise<Map<string, GeoPayload>> {
  const repository = getSeriesRepository();
  const map = new Map<string, GeoPayload>();
  for (const series of historySeries) {
    const snapshots = await repository.getSeriesMapSnapshots(series.id);
    for (const snapshot of snapshots) {
      if (map.has(snapshot.id)) continue;
      map.set(snapshot.id, {
        regions: Object.fromEntries(
          snapshot.regions.map((region) => [region.polityId, { geometry: region.geometry, fillBands: region.fillBands }]),
        ),
        outlines: snapshot.outlines,
        reconstructedOutlines: snapshot.reconstructedOutlines,
      });
    }
  }
  return map;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  cache ??= await buildCache();
  const payload = cache.get(decodeURIComponent(id));
  if (!payload) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(payload, { headers: { "cache-control": "public, max-age=3600, s-maxage=3600" } });
}
