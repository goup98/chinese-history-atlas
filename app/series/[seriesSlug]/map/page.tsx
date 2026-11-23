export const revalidate = 3600;

import { renderSeriesPage, type SeriesPageProps } from "@/features/series/series-page";
export default async function SeriesMap(props: SeriesPageProps) { return renderSeriesPage(props, "map"); }
