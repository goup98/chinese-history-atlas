export const revalidate = 3600;

import { SeriesHub } from "@/features/series/series-hub";

export default async function HomePage() { return <SeriesHub />; }
