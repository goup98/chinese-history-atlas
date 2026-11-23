"use client";

import { useEffect, useState } from "react";
import type { HistoricalMapSnapshot } from "@/types/series";
import { isGeometryMissing } from "@/lib/maps/slim-snapshot";

type GeoPayload = {
  regions: Record<string, { geometry?: unknown; fillBands?: unknown }>;
  outlines?: unknown;
  reconstructedOutlines?: unknown;
};

/** 快照只带元数据时，按 id 拉取几何数据并合并；已有几何则原样返回。 */
export function useSnapshotGeometry(snapshot?: HistoricalMapSnapshot): HistoricalMapSnapshot | undefined {
  const [resolved, setResolved] = useState<HistoricalMapSnapshot | undefined>(snapshot);
  const id = snapshot?.id;
  const url = (snapshot as { geometryUrl?: string } | undefined)?.geometryUrl;

  useEffect(() => {
    if (!snapshot) { setResolved(undefined); return; }
    setResolved(snapshot);
    if (!url || !isGeometryMissing(snapshot)) return;
    let alive = true;
    fetch(url, { cache: "force-cache" })
      .then((response) => (response.ok ? response.json() : undefined))
      .then((payload: GeoPayload | undefined) => {
        if (!alive || !payload?.regions) return;
        setResolved({
          ...snapshot,
          regions: snapshot.regions.map((region) => ({
            ...region,
            geometry: (payload.regions[region.polityId]?.geometry ?? region.geometry) as typeof region.geometry,
            fillBands: (payload.regions[region.polityId]?.fillBands ?? region.fillBands) as typeof region.fillBands,
          })),
          outlines: (payload.outlines ?? snapshot.outlines) as HistoricalMapSnapshot["outlines"],
          reconstructedOutlines: (payload.reconstructedOutlines ?? snapshot.reconstructedOutlines) as HistoricalMapSnapshot["reconstructedOutlines"],
        } as unknown as HistoricalMapSnapshot);
      })
      .catch(() => { /* 保持空几何，等下一次交互重试 */ });
    return () => { alive = false; };
    // snapshot 每次渲染都是新对象，用 id 作为依赖避免死循环
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, url]);

  return resolved;
}
